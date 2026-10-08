import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

# Load forecast dataset
df = pd.read_csv("data/processed/forecast_dataset.csv")

# Drop columns that shouldn't be used as features
X = df.drop(["Future_AQI", "Date", "AQI_Bucket"], axis=1)

# One-Hot Encode City
X = pd.get_dummies(X, columns=["City"], dtype=int)

# Target
y = df["Future_AQI"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Training Shape:", X_train.shape)
print("Testing Shape:", X_test.shape)

# Random Forest Model
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)

print("\nTraining Forecast Model...")

model.fit(X_train, y_train)

# Predictions
predictions = model.predict(X_test)

# Metrics
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\nForecast Model Performance")
print("=" * 40)
print(f"MAE : {mae:.2f}")
print(f"R²  : {r2:.4f}")

# Save model
os.makedirs("models", exist_ok=True)

joblib.dump(model, "models/forecast_model.pkl")
joblib.dump(X.columns.tolist(), "models/forecast_features.pkl")

print("\n✅ Forecast model saved successfully!")