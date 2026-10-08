import pandas as pd

# Load featured dataset
df = pd.read_csv("datasets/improved_cleaned_city_day.csv")
print("Original Columns:")
print(df.columns)

# Drop columns that won't be used for training
df = df.drop(["Date", "AQI_Bucket"], axis=1)

# Convert City names into numbers
df = pd.get_dummies(df, columns=["City"], drop_first=True, dtype=int)

# Separate features and target
X = df.drop("AQI", axis=1)
y = df["AQI"]

print("\nFeatures Shape:", X.shape)
print("Target Shape:", y.shape)

print("\nFirst 5 rows of Features:")
print(X.head())

print("\nFirst 5 Target Values:")
print(y.head())

# Save processed dataset
df.to_csv("datasets/ml_ready_dataset.csv", index=False)
print("\n✅ ML-ready dataset saved successfully!")