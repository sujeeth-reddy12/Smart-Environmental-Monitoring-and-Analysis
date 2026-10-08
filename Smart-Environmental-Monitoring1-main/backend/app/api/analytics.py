from fastapi import APIRouter, Depends, HTTPException, Query

from app.config.health_score import calculate_health_score
from app.database.mongodb import ENVIRONMENTAL_DATA_COLLECTION, get_database
from app.services.environment_service import get_latest_environment
from app.utils.security import get_current_user


router = APIRouter(tags=["Environmental Analytics"])


@router.get("/environment/health-score")
async def health_score(city: str):
    document = await get_latest_environment(city)
    if not document:
        raise HTTPException(status_code=404, detail=f"No environmental data found for {city}")
    return {"city": city, **document["health_score"]}


@router.get("/locations/compare")
async def compare_locations(cities: list[str] = Query(min_length=1, max_length=5)):
    rows = []
    for city in cities:
        document = await get_latest_environment(city)
        if not document:
            continue
        air = document.get("air_quality", {})
        weather = document.get("weather", {})
        rows.append({
            "location": city,
            "timestamp": document.get("collected_at"),
            "aqi": air.get("aqi"),
            "pm25": air.get("pm25"),
            "pm10": air.get("pm10"),
            "temperature": weather.get("temperature"),
            "humidity": weather.get("humidity"),
            "health_score": document.get("health_score"),
            "source": document.get("source", "last_available"),
        })
    return {"locations_requested": len(cities), "locations_included": len(rows), "rows": rows}


@router.get("/locations/ranking")
async def location_ranking(limit: int = 10):
    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")
    names = await database[ENVIRONMENTAL_DATA_COLLECTION].distinct("city")
    rows = []
    seen_locations = set()
    for city in names:
        location_key = city.strip().lower()
        if location_key in {"delhi", "new delhi"}:
            location_key = "delhi"
        if location_key in seen_locations:
            continue
        seen_locations.add(location_key)
        document = await get_latest_environment(city)
        if not document or document.get("health_score", {}).get("score") is None:
            continue
        air = document.get("air_quality", {})
        rows.append({
            "location": city,
            "aqi": air.get("aqi"),
            "pm25": air.get("pm25"),
            "health_score": document["health_score"]["score"],
            "source": document.get("source", "last_available"),
        })
    rows.sort(key=lambda row: row["health_score"], reverse=True)
    return {
        "locations_included": len(rows),
        "top_cleaner_locations": rows[:limit],
        "most_polluted_locations": sorted(rows, key=lambda row: (row.get("aqi") is None, row.get("aqi", 0)), reverse=True)[:limit],
    }