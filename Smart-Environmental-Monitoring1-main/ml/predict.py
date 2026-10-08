import requests
import joblib
import pandas as pd

from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
# ----------------------------
# Load ML model
# ----------------------------
model = joblib.load("models/aqi_model.pkl")
feature_names = joblib.load("models/feature_names.pkl")

forecast24_model = joblib.load("models/forecast_24_model.pkl")
forecast72_model = joblib.load("models/forecast_72_model.pkl")

forecast_features = joblib.load("models/forecast_features.pkl")




city = input("Enter City: ")

# ----------------------------
# Get Latitude & Longitude
# ----------------------------
geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={city},IN&limit=1&appid={API_KEY}"

geo = requests.get(geo_url).json()

if len(geo) == 0:
    print("City not found!")
    exit()
lat = geo[0]["lat"]
lon = geo[0]["lon"]

# ----------------------------
# Fetch Live Pollution Data
# ----------------------------
air_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"

air = requests.get(air_url).json()

components = air["list"][0]["components"]

print("\nToday's Pollutants")
print("-------------------------")

for k, v in components.items():
    print(f"{k}: {v}")

# ----------------------------
# Current Date
# ----------------------------


# ----------------------------
# Prepare Model Input
# ----------------------------
input_data = {}

for feature in feature_names:
    input_data[feature] = 0

input_data["PM2.5"] = components["pm2_5"]
input_data["PM10"] = components["pm10"]
input_data["NO"] = components["no"]
input_data["NO2"] = components["no2"]

# Approximate NOx
input_data["NOx"] = components["no"] + components["no2"]

input_data["NH3"] = components["nh3"]
input_data["CO"] = components["co"] / 1000
input_data["SO2"] = components["so2"]
input_data["O3"] = components["o3"]

# OpenWeather doesn't provide these
input_data["Benzene"] = 0
input_data["Toluene"] = 0
input_data["Xylene"] = 0



city_column = f"City_{city}"

if city_column in input_data:
    input_data[city_column] = 1

X = pd.DataFrame([input_data])

prediction = model.predict(X)[0]
# ============================
# Future AQI Forecast
# ============================

forecast_input = {}

# Create all 38 features
for feature in forecast_features:
    forecast_input[feature] = 0


# Pollution values
forecast_input["PM2.5"] = components["pm2_5"]
forecast_input["PM10"] = components["pm10"]
forecast_input["NO"] = components["no"]
forecast_input["NO2"] = components["no2"]

forecast_input["NOx"] = components["no"] + components["no2"]

forecast_input["NH3"] = components["nh3"]
forecast_input["CO"] = components["co"] / 1000
forecast_input["SO2"] = components["so2"]
forecast_input["O3"] = components["o3"]


# Missing pollutants
forecast_input["Benzene"] = 0
forecast_input["Toluene"] = 0
forecast_input["Xylene"] = 0


# Current AQI as input
forecast_input["AQI"] = prediction


# City encoding
city_column = f"City_{city}"

if city_column in forecast_input:
    forecast_input[city_column] = 1


forecast_df = pd.DataFrame([forecast_input])

future_aqi_24 = forecast24_model.predict(forecast_df)[0]
future_aqi_72 = forecast72_model.predict(forecast_df)[0]


print("\n==========================")
print(f"Current AQI          : {prediction:.2f}")
print(f"24 Hour Forecast AQI : {future_aqi_24:.2f}")
print(f"72 Hour Forecast AQI : {future_aqi_72:.2f}")


# ----------------------------
# AQI Category
# ----------------------------
if prediction <= 50:
    category = "Good"
    advice = "Air quality is satisfactory."

elif prediction <= 100:
    category = "Satisfactory"
    advice = "Sensitive individuals should reduce prolonged outdoor activities."

elif prediction <= 200:
    category = "Moderate"
    advice = "People with respiratory diseases should limit outdoor activities."

elif prediction <= 300:
    category = "Poor"
    advice = "Avoid outdoor exercise and wear a mask."

elif prediction <= 400:
    category = "Very Poor"
    advice = "Stay indoors as much as possible."

else:
    category = "Severe"
    advice = "Avoid going outside. Follow government advisories."

print("AQI Category:", category)
print("\nHealth Recommendation:")
print(advice)