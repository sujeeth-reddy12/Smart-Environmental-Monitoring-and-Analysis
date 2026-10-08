from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Optional, Tuple

import requests
from dotenv import load_dotenv
from app.integrations.geocoding import get_coordinates

from app.utils.aqi_calculator import calculate_aqi


if TYPE_CHECKING:
    from app.models.aqi import AQIResponse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(BASE_DIR, ".env"))

logger = logging.getLogger(__name__)

AIR_POLLUTION_API_URL = "https://api.openweathermap.org/data/2.5/air_pollution"
REQUEST_TIMEOUT_SECONDS = 20
REQUEST_ATTEMPTS = 3


def get_aqi_data(city: str) -> Optional[Dict[str, Any]]:
    """Fetch current air quality data from the OpenWeather Air Pollution API.

    Returns a dictionary with the AQI metrics and timestamp when the request
    succeeds. Returns None when the request cannot be completed or the response is malformed.
    """
    location = get_coordinates(city)

    if location is None:
        return None

    lat = location["lat"]
    lon = location["lon"]

    api_key = os.getenv("OPENWEATHER_API_KEY")

    params: Dict[str, str] = {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
    }

    response = None
    for attempt in range(1, REQUEST_ATTEMPTS + 1):
        try:
            response = requests.get(
                AIR_POLLUTION_API_URL,
                params=params,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            break
        except requests.Timeout as exc:
            logger.warning(
                "AQI request timed out on attempt %s/%s: %s",
                attempt,
                REQUEST_ATTEMPTS,
                exc,
            )
        except requests.ConnectionError as exc:
            logger.warning(
                "AQI connection failed on attempt %s/%s: %s",
                attempt,
                REQUEST_ATTEMPTS,
                exc,
            )
        except requests.RequestException as exc:
            logger.warning("AQI request failed: %s", exc)
            return None

    if response is None:
        return None

    try:
        payload = response.json()
    except ValueError as exc:
        logger.warning("AQI response contained invalid JSON: %s", exc)
        return None

    try:
        if not isinstance(payload, dict):
            logger.warning("AQI response payload was not a JSON object.")
            return None

        entries = payload.get("list")
        if not isinstance(entries, list) or not entries:
            logger.warning("AQI response did not contain a valid 'list' payload.")
            return None

        pollution_entry = entries[0]
        if not isinstance(pollution_entry, dict):
            logger.warning("AQI response entry was not a JSON object.")
            return None

        main_metrics = pollution_entry.get("main", {})
        if not isinstance(main_metrics, dict):
            logger.warning("AQI response main metrics were not structured as expected.")
            return None

        pollution_entry = entries[0]
        if not isinstance(pollution_entry, dict):
            logger.warning("AQI response entry was not a JSON object.")
            return None

        main_metrics = pollution_entry.get("main", {})
        components = pollution_entry.get("components", {})
        if not isinstance(main_metrics, dict) or not isinstance(components, dict):
            logger.warning("AQI response metrics were not structured as expected.")
            return None

        timestamp_value = pollution_entry.get("dt")
        if isinstance(timestamp_value, (int, float)):
            timestamp = datetime.fromtimestamp(int(timestamp_value),tz=timezone.utc).isoformat()
        elif timestamp_value is None:
            timestamp = None
        else:
            timestamp = str(timestamp_value)

        print("PM2.5:", components.get("pm2_5"))
        print("PM10 :", components.get("pm10"))
        print("Calculated AQI:", calculate_aqi(
            components.get("pm2_5", 0),
            components.get("pm10", 0),
        ))

        return {
            "aqi": calculate_aqi(
                components.get("pm2_5", 0),
                components.get("pm10", 0),
            ),
            "pm25": components.get("pm2_5"),
            "pm10": components.get("pm10"),
            "co": components.get("co"),
            "no2": components.get("no2"),
            "so2": components.get("so2"),
            "o3": components.get("o3"),
            "nh3": components.get("nh3"),
            "timestamp": timestamp,
        }
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        logger.warning("AQI response payload could not be parsed: %s", exc)
        return None


if __name__ == "__main__":
    print(get_aqi_data("Hyderabad"))