"""Async collector for environmental data stored in MongoDB."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.integrations.openweather_aqi import get_aqi_data
from app.integrations.weather_service import get_weather_data
from app.integrations.geocoding import get_coordinates

logger = logging.getLogger(__name__)


def _get_location_metadata(
    city: str,
    latitude: float,
    longitude: float,
) -> Dict[str, Any]:
    return {
        "city": city,
        "latitude": latitude,
        "longitude": longitude,
    }


def collect_environmental_data(city: str) -> Dict[str, Any]:
    """
    Fetch, clean, standardize and merge
    weather and AQI data.

    Returns a standardized environmental
    data document.
    """
    logger.info("Starting environmental data collection")
    weather_data = get_weather_data(city)
    aqi_data = get_aqi_data(city)

    if aqi_data is None:
        logger.warning("Failed to fetch environmental data from upstream services")
        return {
            "success": False,
            "message": "Failed to fetch environmental data.",
            "weather": weather_data,
            "aqi": aqi_data,
        }

    try:
        location = get_coordinates(city)

        if location is None:
            return {
                "success": False,
                "message": f"Could not find coordinates for {city}",
            }
        
        document = {
            **_get_location_metadata(
                city=city.strip(),
                latitude=location["lat"],
                longitude=location["lon"],
            ),

            "weather": weather_data or {},

            "air_quality": aqi_data,

            "source": "live_api",
            "location_name": location["city"],
            "field_status": {
                **{name: "LIVE" for name, value in aqi_data.items() if value is not None},
                **{name: "LIVE" for name, value in (weather_data or {}).items() if value is not None},
            },

            "collected_at": datetime.now(timezone.utc).isoformat(),
        }

        return {
            "success": True,
            "message": "Environmental data collected successfully.",
            "data": document,
        }
    except Exception as exc:  # pragma: no cover - defensive logging path
        logger.exception("Failed to store environmental data: %s", exc)
        return {
            "success": False,
            "message": "Failed to store environmental data.",
        }
if __name__ == "__main__":
    result = collect_environmental_data("Hyderabad")
    print(result)