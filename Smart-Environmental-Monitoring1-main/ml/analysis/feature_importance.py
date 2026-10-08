import joblib
import pandas as pd
import matplotlib.pyplot as plt
import os

# Create outputs folder if it doesn't exist
os.makedirs("outputs", exist_ok=True)

# Load model
model = joblib.load("models/best_aqi_model.pkl")

# Load feature names
features = joblib.load("models/best_feature_names.pkl")

# Feature importance DataFrame
importance = pd.DataFrame({
    "Feature": features,
    "Importance": model.feature_importances_
})

# Sort descending
importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("="*50)
print("TOP 15 IMPORTANT FEATURES")
print("="*50)

print(importance.head(15))

# Plot
plt.figure(figsize=(12,6))

plt.bar(
    importance["Feature"][:15],
    importance["Importance"][:15]
)

plt.title("Top 15 Important Features for AQI Prediction")

plt.xlabel("Features")

plt.ylabel("Importance")

plt.xticks(rotation=60)

plt.tight_layout()

plt.savefig("outputs/feature_importance.png")

plt.show()

print("\n✅ Graph saved as outputs/feature_importance.png")