import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor


print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("SAVING BEST AQI MODEL")
print("=" * 60)


# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "ml_ready_dataset.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# Load dataset
df = pd.read_csv(DATASET_PATH)

print("\nDataset Shape:", df.shape)


# Separate features and target
X = df.drop("AQI", axis=1)
y = df["AQI"]


print("Features:", X.shape[1])
print("Target: AQI")


# Same split used during model comparison
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# Best model identified during comparison
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)


print("\nTraining Random Forest...")

model.fit(X_train, y_train)


# Save model
model_path = MODEL_DIR / "aqi_model.pkl"

joblib.dump(model, model_path)


# Save feature names
feature_path = MODEL_DIR / "feature_names.pkl"

joblib.dump(
    X.columns.tolist(),
    feature_path
)


print("\n" + "=" * 60)
print("MODEL SAVED SUCCESSFULLY")
print("=" * 60)

print("Model:")
print(model_path)

print("\nFeature names:")
print(feature_path)

print("\nNumber of features:", len(X.columns))

print("\nTraining completed successfully.")