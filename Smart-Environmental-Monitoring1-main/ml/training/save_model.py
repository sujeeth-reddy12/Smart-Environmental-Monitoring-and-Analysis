import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor


# Load dataset
df = pd.read_csv("datasets/ml_ready_dataset.csv")


# Features and Target
X = df.drop("AQI", axis=1)
y = df["AQI"]


# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# Train the best model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)


model.fit(X_train, y_train)


# Save model
joblib.dump(
    model,
    "models/aqi_model.pkl"
)


# Save feature names
joblib.dump(
    X.columns.tolist(),
    "models/feature_names.pkl"
)


print("✅ Model saved successfully!")
print("Model: models/aqi_model.pkl")
print("Features: models/feature_names.pkl")