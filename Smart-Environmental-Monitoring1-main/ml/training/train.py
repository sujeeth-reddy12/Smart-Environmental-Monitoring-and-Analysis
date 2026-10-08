import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_DIR))

from ml.training.preprocessing_pipeline import (
    build_preprocessor,
    MODEL_FEATURES,
    prepare_training_frame,
    resolve_dataset_file,
    split_features_target,
)


def main() -> None:
    dataset_path = resolve_dataset_file(Path(__file__).resolve().parents[1] / "datasets")
    df = pd.read_csv(dataset_path)
    prepared = prepare_training_frame(df)
    selected_columns = [column for column in MODEL_FEATURES if column in prepared.columns]
    if selected_columns != MODEL_FEATURES:
        raise ValueError(f"Training data is missing required model features: {set(MODEL_FEATURES) - set(selected_columns)}")
    prepared = prepared[selected_columns + ["AQI"]]

    X_train, X_test, y_train, y_test = split_features_target(prepared)
    preprocessor = build_preprocessor(prepared)

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)),
        ]
    )

    output_dir = Path(__file__).resolve().parents[1] / "models"
    output_dir.mkdir(parents=True, exist_ok=True)

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    rmse = mean_squared_error(y_test, preds) ** 0.5
    r2 = r2_score(y_test, preds)

    print("Training Data Shape:", X_train.shape)
    print("Testing Data Shape:", X_test.shape)
    print(f"MAE  : {mae:.2f}")
    print(f"RMSE : {rmse:.2f}")
    print(f"R²   : {r2:.4f}")

    joblib.dump(model, output_dir / "aqi_model.pkl")
    joblib.dump(preprocessor, output_dir / "preprocessor.pkl")
    joblib.dump(list(X_train.columns), output_dir / "feature_columns.pkl")
    joblib.dump(
        {
            "features": selected_columns,
            "target": "AQI",
            "problem_type": "regression",
            "selected_model": "Random Forest",
            "metrics": [{"Model": "Random Forest", "MAE": mae, "MSE": mean_squared_error(y_test, preds), "RMSE": rmse, "R2": r2}],
        },
        output_dir / "feature_info.pkl",
    )
    print("\n✅ Full preprocessing + model pipeline saved successfully.")


if __name__ == "__main__":
    main()