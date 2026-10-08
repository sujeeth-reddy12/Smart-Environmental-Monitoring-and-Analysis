import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("24-HOUR AND 72-HOUR FORECAST MODEL TRAINING")
print("=" * 60)

# Project paths
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "datasets",
    "forecast_dataset.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

os.makedirs(MODEL_DIR, exist_ok=True)

# Load dataset
df = pd.read_csv(DATASET_PATH)

print("\nDataset Shape:", df.shape)

# Features
X = df.drop(
    ["Future_AQI_24", "Future_AQI_72", "Date"],
    axis=1
)

# One-hot encode City
X = pd.get_dummies(
    X,
    columns=["City"],
    dtype=int
)

print("Feature Shape:", X.shape)

# Save feature names
joblib.dump(
    X.columns.tolist(),
    os.path.join(MODEL_DIR, "forecast_features.pkl")
)

targets = {
    "24": df["Future_AQI_24"],
    "72": df["Future_AQI_72"]
}

for horizon, y in targets.items():

    print("\n" + "-" * 60)
    print("Training", horizon, "Hour Forecast Model")
    print("-" * 60)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, pred)
    r2 = r2_score(y_test, pred)

    print("MAE :", round(mae, 2))
    print("R2  :", round(r2, 4))

    model_path = os.path.join(
        MODEL_DIR,
        f"forecast_{horizon}_model.pkl"
    )

    joblib.dump(model, model_path)

    print("Model saved to:")
    print(model_path)

print("\n" + "=" * 60)
print("FORECAST MODEL TRAINING COMPLETED")
print("=" * 60)