from __future__ import annotations

from pathlib import Path
from typing import Iterable

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"

CITY_COLUMN = "City"
DATE_COLUMN = "Date"
TARGET_COLUMN = "AQI"
MODEL_FEATURES = ["PM2.5", "PM10", "CO", "NO2", "SO2", "O3"]

COMPATIBLE_NUMERIC_COLUMNS = [
    "PM2.5",
    "PM10",
    "NO",
    "NO2",
    "NOx",
    "NH3",
    "CO",
    "SO2",
    "O3",
    "Benzene",
    "Toluene",
    "Xylene",
    "AQI",
    "Year",
    "Month",
    "Day",
    "DayOfWeek",
]

COLUMN_ALIASES = {
    "pm25": "PM2.5",
    "pm2_5": "PM2.5",
    "pm10": "PM10",
    "no2": "NO2",
    "nox": "NOx",
    "nh3": "NH3",
    "so2": "SO2",
    "o3": "O3",
    "co": "CO",
    "aqi": "AQI",
    "date": "Date",
    "city": "City",
}


def _normalise_name(value: str) -> str:
    return str(value).strip().lower().replace(" ", "").replace("_", "").replace("-", "")


def resolve_dataset_file(dataset_dir: Path | str = DATASET_DIR) -> Path:
    dataset_root = Path(dataset_dir)
    direct = dataset_root / "city_day.csv"
    if direct.is_file():
        return direct

    nested = dataset_root / "city_day.csv" / "city_day.csv"
    if nested.is_file():
        return nested

    zipped = dataset_root / "city_day.csv.zip"
    if zipped.exists():
        import zipfile

        with zipfile.ZipFile(zipped, "r") as archive:
            csv_name = archive.namelist()[0]
            target = dataset_root / csv_name.split("/")[-1]
            if not target.exists():
                archive.extract(csv_name, dataset_root)
            return target

    raise FileNotFoundError(
        f"Dataset not found. Expected a city_day.csv file under {dataset_root} or a nested folder containing it."
    )


def resolve_dataset_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map case/format variations to the canonical AQI column names used by the project."""
    if df.empty:
        return df.copy()

    mapping: dict[str, str] = {}
    for column in df.columns:
        key = _normalise_name(column)
        canonical = COLUMN_ALIASES.get(key, str(column))
        mapping[str(column)] = canonical

    renamed = df.rename(columns=mapping)

    remaining = [
        col for col in renamed.columns
        if col in {CITY_COLUMN, DATE_COLUMN, TARGET_COLUMN} or col in COMPATIBLE_NUMERIC_COLUMNS
    ]
    return renamed.loc[:, remaining].copy()


def prepare_training_frame(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Apply conservative preprocessing while preserving useful records."""
    df = resolve_dataset_columns(raw_df).copy()
    if df.empty:
        raise ValueError("Dataset is empty after selecting supported columns.")

    if CITY_COLUMN in df.columns:
        df[CITY_COLUMN] = df[CITY_COLUMN].astype(str).str.strip()

    df = df.drop_duplicates().copy()

    for column in [DATE_COLUMN]:
        if column in df.columns:
            df[column] = pd.to_datetime(df[column], errors="coerce")

    for column in df.columns:
        if column in {CITY_COLUMN, DATE_COLUMN}:
            continue
        if pd.api.types.is_numeric_dtype(df[column]):
            df[column] = pd.to_numeric(df[column], errors="coerce")

    if DATE_COLUMN in df.columns:
        df = df.dropna(subset=[DATE_COLUMN]).copy()

    if TARGET_COLUMN in df.columns:
        df[TARGET_COLUMN] = pd.to_numeric(df[TARGET_COLUMN], errors="coerce")
        df = df.dropna(subset=[TARGET_COLUMN]).copy()

    numeric_feature_columns = [
        column for column in COMPATIBLE_NUMERIC_COLUMNS
        if column in df.columns and pd.api.types.is_numeric_dtype(df[column])
    ]

    for column in numeric_feature_columns:
        if column == TARGET_COLUMN:
            continue
        if CITY_COLUMN in df.columns:
            df[column] = df.groupby(CITY_COLUMN)[column].transform(
                lambda values: values.fillna(values.median())
            )
        df[column] = df[column].fillna(df[column].median())

    if TARGET_COLUMN in df.columns:
        df[TARGET_COLUMN] = df[TARGET_COLUMN].fillna(df[TARGET_COLUMN].median())

    if DATE_COLUMN in df.columns:
        df["Year"] = df[DATE_COLUMN].dt.year
        df["Month"] = df[DATE_COLUMN].dt.month
        df["Day"] = df[DATE_COLUMN].dt.day
        df["DayOfWeek"] = df[DATE_COLUMN].dt.dayofweek

    for column in numeric_feature_columns:
        if column not in df.columns or column == TARGET_COLUMN:
            continue
        q1 = df[column].quantile(0.25)
        q3 = df[column].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df[column] = df[column].clip(lower=lower_bound, upper=upper_bound)

    if TARGET_COLUMN in df.columns:
        q1 = df[TARGET_COLUMN].quantile(0.25)
        q3 = df[TARGET_COLUMN].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df[TARGET_COLUMN] = df[TARGET_COLUMN].clip(lower=lower_bound, upper=upper_bound)

    return df.sort_values(by=[CITY_COLUMN, DATE_COLUMN], kind="mergesort").reset_index(drop=True)


def build_preprocessor(df: pd.DataFrame) -> ColumnTransformer:
    feature_columns = [column for column in df.columns if column != TARGET_COLUMN]
    numeric_columns = [
        column for column in feature_columns
        if column != CITY_COLUMN and pd.api.types.is_numeric_dtype(df[column])
    ]
    categorical_columns = [CITY_COLUMN] if CITY_COLUMN in df.columns else []

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    transformers = []
    if numeric_columns:
        transformers.append(("numeric", numeric_pipeline, numeric_columns))
    if categorical_columns:
        transformers.append(("categorical", categorical_pipeline, categorical_columns))

    if not transformers:
        raise ValueError("No usable feature columns were found in the dataset after preprocessing.")

    return ColumnTransformer(transformers=transformers, remainder="drop")


def split_features_target(df: pd.DataFrame):
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' is missing from the dataset.")

    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]
    return train_test_split(X, y, test_size=0.2, random_state=42)


def save_preprocessed_dataset(df: pd.DataFrame, output_path: Path | str | None = None) -> Path:
    target_path = Path(output_path) if output_path is not None else DATASET_DIR / "cleaned_city_day.csv"
    target_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(target_path, index=False)
    return target_path


def save_training_pipeline(model, preprocessor: ColumnTransformer, feature_columns: Iterable[str], model_path: Path | str | None = None) -> dict[str, Path]:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_target = Path(model_path) if model_path is not None else MODELS_DIR / "aqi_model.pkl"
    preprocessor_target = MODELS_DIR / "preprocessor.pkl"
    feature_target = MODELS_DIR / "feature_columns.pkl"

    joblib.dump(model, model_target)
    joblib.dump(preprocessor, preprocessor_target)
    joblib.dump(list(feature_columns), feature_target)

    return {"model": model_target, "preprocessor": preprocessor_target, "features": feature_target}
