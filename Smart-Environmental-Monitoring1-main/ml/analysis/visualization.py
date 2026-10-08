import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# Load dataset
df = pd.read_csv(
    "data/processed/forecast_dataset.csv"
)


# Convert Date column
df["Date"] = pd.to_datetime(df["Date"])


# Select one city for visualization
city = "Hyderabad"

city_data = df[df["City"] == city]


# Sort by date
city_data = city_data.sort_values("Date")


# -------------------------------
# 1. AQI Trend Graph
# -------------------------------

plt.figure(figsize=(12,5))

plt.plot(
    city_data["Date"],
    city_data["AQI"]
)

plt.title(
    f"AQI Trend - {city}"
)

plt.xlabel("Date")
plt.ylabel("AQI")

plt.xticks(rotation=45)

plt.grid()

plt.show()



# -------------------------------
# 2. Future AQI Forecast Trend
# -------------------------------

plt.figure(figsize=(12,5))

plt.plot(
    city_data["Date"],
    city_data["AQI"],
    label="Current AQI"
)


plt.plot(
    city_data["Date"],
    city_data["Future_AQI"],
    label="Future AQI"
)


plt.title(
    f"AQI Forecast Comparison - {city}"
)

plt.xlabel("Date")
plt.ylabel("AQI")

plt.legend()

plt.grid()

plt.show()



# -------------------------------
# 3. Pollutant Analysis
# -------------------------------

pollutants = [
    "PM2.5",
    "PM10",
    "NO2",
    "CO",
    "SO2",
    "O3"
]


avg_pollution = city_data[pollutants].mean()


plt.figure(figsize=(10,5))

sns.barplot(
    x=avg_pollution.index,
    y=avg_pollution.values
)


plt.title(
    f"Average Pollutant Levels - {city}"
)

plt.xlabel("Pollutants")
plt.ylabel("Average Concentration")

plt.show()
# ---------------------------------
# 4. Monthly AQI Trend
# ---------------------------------

df["Month"] = df["Date"].dt.month

monthly_aqi = df.groupby("Month")["AQI"].mean()


plt.figure(figsize=(10,5))

plt.plot(
    monthly_aqi.index,
    monthly_aqi.values,
    marker="o"
)

plt.title("Monthly Average AQI Trend")

plt.xlabel("Month")
plt.ylabel("Average AQI")

plt.xticks(
    range(1,13)
)

plt.grid()

plt.show()



# ---------------------------------
# 5. Top 10 Most Polluted Cities
# ---------------------------------

city_aqi = (
    df.groupby("City")["AQI"]
    .mean()
    .sort_values(ascending=False)
    .head(10)
)


plt.figure(figsize=(10,5))

sns.barplot(
    x=city_aqi.values,
    y=city_aqi.index
)


plt.title(
    "Top 10 Most Polluted Cities"
)

plt.xlabel(
    "Average AQI"
)

plt.ylabel(
    "City"
)

plt.show()



# ---------------------------------
# 6. AQI Category Distribution
# ---------------------------------

category_count = df["AQI_Bucket"].value_counts()


plt.figure(figsize=(7,7))

plt.pie(
    category_count.values,
    labels=category_count.index,
    autopct="%1.1f%%"
)


plt.title(
    "AQI Category Distribution"
)

plt.show()