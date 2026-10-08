import pandas as pd
import os
from pathlib import Path

# Load original dataset

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"

df = pd.read_csv(DATASET_DIR / "city_day.csv")

print("Original Shape:", df.shape)

# Remove duplicate rows
df.drop_duplicates(inplace=True)

# Pollutant columns
pollutants = [
    "PM2.5",
    "PM10",
    "NO",
    "NO2",
    "NOx",
    "NH3",
    "CO",
    "SO2",
    "O3",
    "Benzene",
    "Toluene",
    "Xylene"
]

# Fill pollutant missing values with median
# Fill missing values using the median of the same city
for col in pollutants:
    df[col] = df.groupby("City")[col].transform(
        lambda x: x.fillna(x.median())
    )

    # If an entire city has missing values for a pollutant,
    # fill with the overall median
    df[col] = df[col].fillna(df[col].median())
# Remove rows where AQI is missing
df.dropna(subset=["AQI"], inplace=True)

# Remove rows where AQI_Bucket is missing
df.dropna(subset=["AQI_Bucket"], inplace=True)

print("\nNew Shape:", df.shape)

print("\nRemaining Missing Values:")
print(df.isnull().sum())


# Save
df.to_csv(
    DATASET_DIR / "improved_cleaned_city_day.csv",
    index=False
)
print("\n✅ Improved dataset saved successfully!")