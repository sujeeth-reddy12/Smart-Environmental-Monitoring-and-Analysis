import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "datasets" / "cleaned_city_day.csv"
OUTPUT_DIR = BASE_DIR / "outputs"

OUTPUT_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATASET)

print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("EXPLORATORY DATA ANALYSIS")
print("=" * 60)

print("\nDataset Shape:")
print(df.shape)

print("\nCities:")
print(df["City"].nunique())

print("\nTop 10 Cities by Number of Records:")
print(df["City"].value_counts().head(10))

print("\nAQI Statistics:")
print(df["AQI"].describe())

print("\nAQI Category Distribution:")
print(df["AQI_Bucket"].value_counts())

# AQI category chart
category_counts = df["AQI_Bucket"].value_counts()

plt.figure(figsize=(10, 6))
plt.bar(category_counts.index, category_counts.values)
plt.title("AQI Category Distribution")
plt.xlabel("AQI Category")
plt.ylabel("Number of Records")
plt.xticks(rotation=30)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "aqi_category_distribution.png")
plt.close()

# Pollutant averages
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

pollutant_means = df[pollutants].mean().sort_values(ascending=False)

print("\nAverage Pollutant Concentrations:")
print(pollutant_means)

plt.figure(figsize=(12, 6))
plt.bar(pollutant_means.index, pollutant_means.values)
plt.title("Average Pollutant Concentrations")
plt.xlabel("Pollutant")
plt.ylabel("Average Concentration")
plt.xticks(rotation=60)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "average_pollutants.png")
plt.close()

# AQI distribution
plt.figure(figsize=(10, 6))
plt.hist(df["AQI"], bins=30)
plt.title("AQI Distribution")
plt.xlabel("AQI")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "aqi_distribution.png")
plt.close()

print("\nEDA completed successfully.")

print("\nGenerated files:")
print("1. aqi_category_distribution.png")
print("2. average_pollutants.png")
print("3. aqi_distribution.png")