"""Thin backend service wrapper for ML AQI predictions."""
from __future__ import annotations
import app.utils.path_setup

from typing import Any

from backend.app.services.aqi_service import collect_and_store_environmental_data
from ml.predictor import (
    predict_all,
    predict_current,
    predict_forecast,
)
from ml.predictor import PredictorError

__all__ = [
    "PredictorError",
    "get_current_prediction",
    "get_forecast_prediction",
    "get_complete_prediction",
]

async def get_current_prediction(city: str) -> dict[str, Any]:
	"""Return the current AQI prediction for a city."""

	try:
		return predict_current(city)
	except PredictorError:
		# Let the API layer decide how to translate ML failures.
		raise


async def get_forecast_prediction(city: str) -> dict[str, Any]:
	"""Return the forecast AQI prediction for a city."""

	try:
		return predict_forecast(city)
	except PredictorError:
		# Keep the service layer thin and transparent.
		raise


async def get_complete_prediction(city: str) -> dict[str, Any]:
	"""Return the full AQI prediction bundle for a city."""
	await collect_and_store_environmental_data(city)
	try:
		return predict_all(city)
	except PredictorError:
		# Preserve ML-specific exceptions for the caller.
		raise
