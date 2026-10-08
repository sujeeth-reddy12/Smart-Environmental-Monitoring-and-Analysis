import logging
from datetime import datetime, timezone
from typing import Optional

from app.integrations.data_collector import collect_environmental_data
from app.models.aqi import AQIResponse
from app.repositories.aqi_repository import (
    get_latest_aqi as repo_get_latest_aqi,
    get_aqi_history as repo_get_aqi_history,
    insert_aqi,
    insert_environmental_data,
)


logger = logging.getLogger(__name__)

async def create_aqi(data: AQIResponse):
    return await insert_aqi(data.model_dump())

async def get_latest_aqi(city: str):
    data = await repo_get_latest_aqi(city)

    if not data:
        return None

    source = data.get("source", "live_api")
    try:
        timestamp = datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))
        age_minutes = (datetime.now(timezone.utc) - timestamp.astimezone(timezone.utc)).total_seconds() / 60
        if age_minutes > 10:
            source = "last_available"
    except (KeyError, TypeError, ValueError):
        source = "last_available"

    return AQIResponse(
        city=data["city"],
        aqi=data["aqi"],
        pm25=data["pm25"],
        pm10=data["pm10"],
        co=data["co"],
        no2=data["no2"],
        so2=data["so2"],
        o3=data["o3"],
        nh3=data["nh3"],
        temperature=data["temperature"],
        humidity=data["humidity"],
        timestamp=data["timestamp"],
        source=source,
        field_status=data.get("field_status", {}) if source == "live_api" else {"data": "LAST_AVAILABLE"},
    )

async def get_aqi_history(city: str, limit: int = 50):
    records = await repo_get_aqi_history(city=city, limit=limit)

    if not records:
        return []

    # Ignore documents that do not match the AQIResponse schema.
    valid_records = [
        r for r in records
        if {
            "city",
            "aqi",
            "pm25",
            "pm10",
            "co",
            "no2",
            "so2",
            "o3",
            "nh3",
            "temperature",
            "humidity",
            "timestamp",
        }.issubset(r.keys())
    ]

    return [
        AQIResponse(
            city=r["city"],
            aqi=r["aqi"],
            pm25=r["pm25"],
            pm10=r["pm10"],
            co=r["co"],
            no2=r["no2"],
            so2=r["so2"],
            o3=r["o3"],
            nh3=r["nh3"],
            temperature=r["temperature"],
            humidity=r["humidity"],
            timestamp=r["timestamp"],
        )
        for r in valid_records
    ]
    
async def collect_and_store_environmental_data(city: str) -> Optional[str]:
    """Collect standardized environmental data and store it in MongoDB.

    Returns:
        The inserted MongoDB document ID when collection succeeds, or ``None``
        if the upstream collection or database write fails.
    """

    # Collect the standardized environmental payload from the integration layer.
    try:
        data = collect_environmental_data(city)
    except Exception as exc:
        logger.exception("Environmental data collection failed: %s", exc)
        return None

    # Stop here when the collector reports a failure.
    if not data.get("success"):
        print(data)
        return None

    # Extract only the standardized document body that should be persisted.
    environmental_document = data.get("data", {})
    # Create a flat AQI document for the dashboard
    flat_document = {
        "city": environmental_document["city"],
        "aqi": environmental_document["air_quality"]["aqi"],
        "pm25": environmental_document["air_quality"]["pm25"],
        "pm10": environmental_document["air_quality"]["pm10"],
        "co": environmental_document["air_quality"]["co"],
        "no2": environmental_document["air_quality"]["no2"],
        "so2": environmental_document["air_quality"]["so2"],
        "o3": environmental_document["air_quality"]["o3"],
        "nh3": environmental_document["air_quality"]["nh3"],
        "temperature": environmental_document.get("weather", {}).get("temperature"),
        "humidity": environmental_document.get("weather", {}).get("humidity"),
        "timestamp": environmental_document["collected_at"],
        "source": environmental_document.get("source", "live_api"),
        "field_status": environmental_document.get("field_status", {}),
    }

    try:
        # Save full environmental data
        inserted_id = await insert_environmental_data(environmental_document)

        # Save simplified AQI data
        await insert_aqi(flat_document)

    except Exception as exc:
        logger.exception("Failed to store environmental data in MongoDB: %s", exc)
        return None

    return str(inserted_id)