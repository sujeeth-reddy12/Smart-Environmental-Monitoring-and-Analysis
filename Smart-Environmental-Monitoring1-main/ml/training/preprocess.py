import joblib
import pandas as pd
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from ml.training.preprocessing_pipeline import (
        DATASET_DIR,
        MODELS_DIR,
        build_preprocessor,
        prepare_training_frame,
        resolve_dataset_file,
        save_preprocessed_dataset,
    )
except ModuleNotFoundError:  # pragma: no cover - fallback when executed as a raw script
    from preprocessing_pipeline import (
        DATASET_DIR,
        MODELS_DIR,
        build_preprocessor,
        prepare_training_frame,
        resolve_dataset_file,
        save_preprocessed_dataset,
    )

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "outputs"

INPUT_FILE = DATASET_DIR / "city_day.csv"
OUTPUT_FILE = DATASET_DIR / "cleaned_city_day.csv"


def main() -> None:
    resolved_input = resolve_dataset_file(DATASET_DIR)

    df = pd.read_csv(resolved_input)
    prepared = prepare_training_frame(df)

    print("=" * 60)
    print("AI-BASED SMART ENVIRONMENTAL MONITORING")
    print("DATA PREPROCESSING")
    print("=" * 60)
    print(f"\nOriginal dataset shape: {df.shape}")
    print(f"Cleaned dataset shape: {prepared.shape}")

    save_preprocessed_dataset(prepared, OUTPUT_FILE)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    preprocessor = build_preprocessor(prepared)
    joblib.dump(preprocessor, MODELS_DIR / "preprocessor.pkl")
    joblib.dump(list(prepared.drop(columns=["AQI"]).columns), MODELS_DIR / "feature_columns.pkl")

    print("\nSaved cleaned dataset to:", OUTPUT_FILE)
    print("Saved preprocessing artifacts to:", MODELS_DIR)
    print("\nPreprocessing completed successfully.")


if __name__ == "__main__":
    main()