import pandas as pd
import matplotlib.pyplot as plt


# Load dataset

df = pd.read_csv(
    "data/processed/forecast_dataset.csv"
)


# Convert date

df["Date"] = pd.to_datetime(df["Date"])


# Extract month name

df["Month"] = df["Date"].dt.month_name()


# Calculate average AQI by month

monthly_aqi = (
    df.groupby("Month")["AQI"]
    .mean()
)


# Arrange months correctly

month_order = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]


monthly_aqi = monthly_aqi.reindex(month_order)


print("==============================")
print("Monthly Average AQI")
print("==============================")


print(monthly_aqi)



# Plot

plt.figure(figsize=(12,5))

plt.plot(
    monthly_aqi.index,
    monthly_aqi.values,
    marker="o"
)


plt.title(
    "Monthly Average AQI Trend"
)

plt.xlabel("Month")

plt.ylabel("Average AQI")


plt.xticks(rotation=45)

plt.grid()

plt.show()



# Best and worst months

worst_month = monthly_aqi.idxmax()
best_month = monthly_aqi.idxmin()


print("\nWorst Air Quality Month:")
print(
    worst_month,
    "AQI:",
    round(monthly_aqi.max(),2)
)


print("\nBest Air Quality Month:")
print(
    best_month,
    "AQI:",
    round(monthly_aqi.min(),2)
)