import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATASET_DIR / "cleaned_city_day.csv"
OUTPUT_FILE = DATASET_DIR / "ml_ready_dataset.csv"

# These are the requested candidate predictors. CO2 is intentionally absent:
# it is not a column in the supplied dataset.
CANDIDATE_FEATURES = ["PM2.5", "PM10", "CO", "NO2", "SO2", "O3"]
TARGET = "AQI"

df = pd.read_csv(INPUT_FILE)

print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("FEATURE ENGINEERING")
print("=" * 60)

print("\nOriginal Shape:", df.shape)

selected_features = [column for column in CANDIDATE_FEATURES if column in df.columns]
missing_candidates = [column for column in CANDIDATE_FEATURES if column not in df.columns]
if TARGET not in df.columns:
    raise ValueError(f"Target column {TARGET!r} is not present in {INPUT_FILE}")
if not selected_features:
    raise ValueError("None of the requested predictor columns exist in the dataset")

# Keep only real predictor columns and the continuous AQI target.
ml_ready = df[selected_features + [TARGET]].copy()
ml_ready = ml_ready.apply(pd.to_numeric, errors="coerce").dropna()

X = ml_ready[selected_features]
y = ml_ready[TARGET]

print("\nFeature Shape:", X.shape)
print("Target Shape:", y.shape)

print("\nFeatures:")
print(selected_features)
if missing_candidates:
    print("Unavailable candidate features (not used):", missing_candidates)
print("Why selected: these pollutant measurements are present in the dataset and are directly relevant to AQI.")

print("\nTarget:")
print(f"{TARGET} (continuous; regression target)")

# Save ML-ready dataset
ml_ready.to_csv(OUTPUT_FILE, index=False)

print("\nML-ready dataset saved to:")
print(OUTPUT_FILE)

print("\nFeature engineering completed successfully.")