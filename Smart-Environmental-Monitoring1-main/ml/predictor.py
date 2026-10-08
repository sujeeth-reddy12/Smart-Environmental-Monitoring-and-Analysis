"""Production-ready AQI prediction helpers for service integration.

This module mirrors the logic in ``predict.py`` while exposing a clean,
import-safe API for backend usage. Models are loaded once at import time and
all user-facing functions return dictionaries instead of printing.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Mapping

import joblib
import pandas as pd
import requests
from dotenv import load_dotenv

from backend.app.utils.aqi_calculator import calculate_aqi

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
OPENWEATHER_AIR_URL = "https://api.openweathermap.org/data/2.5/air_pollution"
HTTP_TIMEOUT_SECONDS = 15.0

API_KEY = os.getenv("OPENWEATHER_API_KEY")


class PredictorError(Exception):
	"""Base exception for prediction failures."""


class ConfigurationError(PredictorError):
	"""Raised when required configuration is missing."""


class ModelLoadError(PredictorError):
	"""Raised when a trained model artifact cannot be loaded."""


class CityNotFoundError(PredictorError):
	"""Raised when OpenWeather cannot geocode the requested city."""


class ExternalServiceError(PredictorError):
	"""Raised when an upstream API request fails or returns invalid data."""


def _require_api_key() -> str:
	"""Return the configured OpenWeather API key or fail fast.

	The key is required at import time so startup fails early when the service
	is misconfigured.
	"""

	if not API_KEY:
		raise ConfigurationError("OPENWEATHER_API_KEY is not configured.")
	return API_KEY


def _load_artifact(filename: str) -> Any:
	"""Load a serialized model or feature list from the local models folder."""

	artifact_path = MODEL_DIR / filename
	if not artifact_path.exists():
		raise ModelLoadError(f"Missing model artifact: {artifact_path}")

	try:
		return joblib.load(artifact_path)
	except Exception as exc:  # pragma: no cover - joblib exceptions vary by file state
		raise ModelLoadError(f"Failed to load model artifact: {artifact_path}") from exc


def _as_feature_list(value: Any, artifact_name: str) -> list[str]:
	"""Normalize a serialized feature collection into a list of strings."""

	try:
		features = list(value)
	except TypeError as exc:
		raise ModelLoadError(f"Invalid feature artifact: {artifact_name}") from exc

	if not features:
		raise ModelLoadError(f"Feature artifact is empty: {artifact_name}")

	return [str(feature) for feature in features]


_require_api_key()

# Models are intentionally loaded once at import time so service calls stay fast.
AQI_MODEL = _load_artifact("aqi_model.pkl")
FEATURE_NAMES = _as_feature_list(_load_artifact("feature_columns.pkl"), "feature_columns.pkl")
FORECAST_24_MODEL = _load_artifact("forecast_24_model.pkl")
FORECAST_72_MODEL = _load_artifact("forecast_72_model.pkl")
FORECAST_FEATURES = _as_feature_list(
	_load_artifact("forecast_features.pkl"),
	"forecast_features.pkl",
)


def _normalize_city(city: str) -> str:
	"""Validate and normalize the incoming city name."""

	normalized_city = city.strip()
	if not normalized_city:
		raise ValueError("city must not be empty")
	return normalized_city


def _request_json(url: str, params: Mapping[str, Any]) -> Any:
	"""Perform an HTTP GET request and return parsed JSON content."""

	try:
		response = requests.get(url, params=params, timeout=HTTP_TIMEOUT_SECONDS)
		response.raise_for_status()
	except requests.RequestException as exc:
		raise ExternalServiceError(f"OpenWeather request failed for {url}") from exc

	try:
		return response.json()
	except ValueError as exc:
		raise ExternalServiceError(f"OpenWeather returned invalid JSON for {url}") from exc


def _fetch_coordinates(city: str) -> dict[str, float]:
	"""Resolve a city name into latitude and longitude."""

	geo_data = _request_json(
		OPENWEATHER_GEO_URL,
		{
			"q": f"{city},IN",
			"limit": 1,
			"appid": _require_api_key(),
		},
	)

	if not isinstance(geo_data, list) or not geo_data:
		raise CityNotFoundError(f"City not found: {city}")

	try:
		first_match = geo_data[0]
		return {
			"lat": float(first_match["lat"]),
			"lon": float(first_match["lon"]),
		}
	except (KeyError, TypeError, ValueError) as exc:
		raise ExternalServiceError(f"Invalid geocoding response for city: {city}") from exc


def _fetch_air_pollution(lat: float, lon: float) -> dict[str, float]:
	"""Fetch the latest pollutant measurements for a coordinate pair."""

	pollution_data = _request_json(
		OPENWEATHER_AIR_URL,
		{
			"lat": lat,
			"lon": lon,
			"appid": _require_api_key(),
		},
	)

	try:
		components = pollution_data["list"][0]["components"]
	except (KeyError, IndexError, TypeError) as exc:
		raise ExternalServiceError("Invalid air pollution response from OpenWeather") from exc

	return {
		"pm2_5": float(components.get("pm2_5", 0.0)),
		"pm10": float(components.get("pm10", 0.0)),
		"no": float(components.get("no", 0.0)),
		"no2": float(components.get("no2", 0.0)),
		"nh3": float(components.get("nh3", 0.0)),
		"co": float(components.get("co", 0.0)),
		"so2": float(components.get("so2", 0.0)),
		"o3": float(components.get("o3", 0.0)),
	}


def _build_pollutant_snapshot(components: Mapping[str, float]) -> dict[str, float]:
	"""Create the pollutant payload shared by current and forecast responses."""

	return {
		"PM2.5": float(components["pm2_5"]),
		"PM10": float(components["pm10"]),
		"NO": float(components["no"]),
		"NO2": float(components["no2"]),
		"NOx": float(components["no"] + components["no2"]),
		"NH3": float(components["nh3"]),
		"CO": float(components["co"]) / 1000.0,
		"SO2": float(components["so2"]),
		"O3": float(components["o3"]),
		"Benzene": 0.0,
		"Toluene": 0.0,
		"Xylene": 0.0,
	}


def _build_current_frame(city: str, components: Mapping[str, float]) -> pd.DataFrame:
	"""Build the feature frame expected by the current AQI model."""

	from datetime import datetime

	now = datetime.now()

	feature_row = {feature: 0.0 for feature in FEATURE_NAMES}
	feature_row.update(_build_pollutant_snapshot(components))

	if "Year" in feature_row:
		feature_row["Year"] = now.year

	if "Month" in feature_row:
		feature_row["Month"] = now.month

	if "Day" in feature_row:
		feature_row["Day"] = now.day

	city_column = f"City_{city}"

	if city_column in feature_row:
		feature_row[city_column] = 1.0

	return pd.DataFrame(
		[feature_row],
		columns=FEATURE_NAMES
	)

def _build_forecast_frame(city: str, components: Mapping[str, float], current_aqi: float) -> pd.DataFrame:
	"""Build the feature frame expected by the forecast models."""

	feature_row = {feature: 0.0 for feature in FORECAST_FEATURES}
	feature_row.update(_build_pollutant_snapshot(components))
	feature_row["AQI"] = float(current_aqi)

	city_column = f"City_{city}"
	if city_column in feature_row:
		feature_row[city_column] = 1.0

	return pd.DataFrame([feature_row], columns=FORECAST_FEATURES)


def _categorize_aqi(aqi: float) -> tuple[str, str]:
	"""Convert an AQI value into a category and health recommendation."""

	if aqi <= 50:
		return "Good", "Air quality is satisfactory."
	if aqi <= 100:
		return (
			"Satisfactory",
			"Sensitive individuals should reduce prolonged outdoor activities.",
		)
	if aqi <= 200:
		return (
			"Moderate",
			"People with respiratory diseases should limit outdoor activities.",
		)
	if aqi <= 300:
		return "Poor", "Avoid outdoor exercise and wear a mask."
	if aqi <= 400:
		return "Very Poor", "Stay indoors as much as possible."
	return "Severe", "Avoid going outside. Follow government advisories."


def _predict_bundle(city: str) -> dict[str, Any]:
	"""Run the full prediction flow once and return a structured payload."""

	normalized_city = _normalize_city(city)
	coordinates = _fetch_coordinates(normalized_city)
	components = _fetch_air_pollution(coordinates["lat"], coordinates["lon"])

	live_aqi = calculate_aqi(
		components["pm2_5"],
		components["pm10"],
	)
	current_frame = _build_current_frame(normalized_city, components)
	current_aqi = float(AQI_MODEL.predict(current_frame)[0])

	forecast_frame = _build_forecast_frame(normalized_city, components, current_aqi)
	forecast_24_aqi = float(FORECAST_24_MODEL.predict(forecast_frame)[0])
	forecast_72_aqi = float(FORECAST_72_MODEL.predict(forecast_frame)[0])

	category, recommendation = _categorize_aqi(current_aqi)
	print("LIVE AQI:", live_aqi)
	print("Returning:", {
		"live_aqi": live_aqi,
		"current_aqi": current_aqi
	})
	return {
		"city": normalized_city,
		"coordinates": coordinates,
		"pollutants": _build_pollutant_snapshot(components),
		"live_aqi": live_aqi,
		"current_aqi": current_aqi,
		"aqi_category": category,
		"health_recommendation": recommendation,
		"forecast_24_aqi": forecast_24_aqi,
		"forecast_72_aqi": forecast_72_aqi,
	}


def predict_current(city: str) -> dict[str, Any]:
	"""Predict the current AQI for a city.

	Returns a dictionary containing the current AQI, category, recommendation,
	coordinates, and pollutant snapshot.
	"""

	bundle = _predict_bundle(city)
	return {
		"city": bundle["city"],
		"coordinates": bundle["coordinates"],
		"pollutants": bundle["pollutants"],
		"current_aqi": bundle["current_aqi"],
		"aqi_category": bundle["aqi_category"],
		"health_recommendation": bundle["health_recommendation"],
	}


def predict_forecast(city: str) -> dict[str, Any]:
	"""Predict the 24-hour and 72-hour AQI forecast for a city."""

	bundle = _predict_bundle(city)
	return {
		"city": bundle["city"],
		"coordinates": bundle["coordinates"],
		"pollutants": bundle["pollutants"],
		"current_aqi": bundle["current_aqi"],
		"forecast_24_aqi": bundle["forecast_24_aqi"],
		"forecast_72_aqi": bundle["forecast_72_aqi"],
	}


def predict_all(city: str) -> dict[str, Any]:
	"""Return the full AQI prediction payload for a city."""

	return _predict_bundle(city)


__all__ = [
	"CityNotFoundError",
	"ConfigurationError",
	"ExternalServiceError",
	"ModelLoadError",
	"PredictorError",
	"predict_all",
	"predict_current",
	"predict_forecast",
]
