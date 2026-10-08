import pandas as pd
from pathlib import Path


print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("FORECAST DATASET CREATION")
print("=" * 60)


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATASET_DIR / "cleaned_city_day.csv"
OUTPUT_FILE = DATASET_DIR / "forecast_dataset.csv"


# Load cleaned historical data
df = pd.read_csv(INPUT_FILE)

print("\nOriginal Shape:", df.shape)


# Convert date
df["Date"] = pd.to_datetime(df["Date"])


# Sort chronologically for each city
df = df.sort_values(
    ["City", "Date"]
).reset_index(drop=True)


# Create future AQI targets
# Dataset is daily:
# +1 day = approximately 24 hours
# +3 days = approximately 72 hours

df["Future_AQI_24"] = (
    df.groupby("City")["AQI"].shift(-1)
)

df["Future_AQI_72"] = (
    df.groupby("City")["AQI"].shift(-3)
)


# Remove rows where future AQI doesn't exist
df = df.dropna(
    subset=["Future_AQI_24", "Future_AQI_72"]
).reset_index(drop=True)


# Save
df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("\nForecast Dataset Shape:", df.shape)

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nForecast columns:")
print(df.columns.tolist())

print("\nForecast dataset created successfully.")