import os
import requests
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct"
REQUEST_TIMEOUT_SECONDS = 20
REQUEST_ATTEMPTS = 3


def get_coordinates(city: str):
    for attempt in range(1, REQUEST_ATTEMPTS + 1):
        try:
            response = requests.get(
                GEOCODE_URL,
                params={
                    "q": city,
                    "limit": 1,
                    "appid": API_KEY,
                },
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            break
        except requests.Timeout:
            logger.warning(
                "Geocoding request timed out on attempt %s/%s",
                attempt,
                REQUEST_ATTEMPTS,
            )
        except requests.ConnectionError:
            logger.warning(
                "Geocoding connection failed on attempt %s/%s",
                attempt,
                REQUEST_ATTEMPTS,
            )
        except requests.RequestException:
            logger.exception("Failed to fetch geocoding data")
            return None
    else:
        return None

    try:
        data = response.json()
    except ValueError:
        logger.exception("Invalid geocoding response payload")
        return None

    if not data:
        return None

    return {
        "city": data[0]["name"],
        "lat": data[0]["lat"],
        "lon": data[0]["lon"],
    }


def search_locations(query: str, limit: int = 8):
    """Search Indian locations using OpenWeather geocoding."""
    try:
        response = requests.get(
            GEOCODE_URL,
            params={"q": f"{query},IN", "limit": limit, "appid": API_KEY},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return [
            {
                "name": item.get("name"),
                "state": item.get("state"),
                "country": item.get("country"),
                "latitude": item.get("lat"),
                "longitude": item.get("lon"),
            }
            for item in response.json()
        ]
    except (requests.RequestException, ValueError):
        return []