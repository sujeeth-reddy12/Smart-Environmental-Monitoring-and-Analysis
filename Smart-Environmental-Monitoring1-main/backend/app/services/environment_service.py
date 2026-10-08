from app.repositories.aqi_repository import get_latest_environment as repo_get_latest_environment
from app.config.thresholds import analyze_thresholds, safety_measures
from app.config.health_score import calculate_health_score

async def get_latest_environment(city: str):
    document = await repo_get_latest_environment(city)
    if not document:
        return None

    air_quality = document.get("air_quality", {})
    parameters = {
        key: value for key, value in air_quality.items()
        if key in {"pm25", "pm10", "co", "no2", "so2", "o3"} and value is not None
    }
    prediction = air_quality.get("aqi")
    if prediction is not None:
        environmental_status, threshold_status = analyze_thresholds(parameters, float(prediction))
        document["environmental_status"] = environmental_status
        document["threshold_status"] = threshold_status
        document["precautions"] = safety_measures(environmental_status)
    weather = document.get("weather", {})
    document["health_score"] = calculate_health_score({
        **air_quality,
        "temperature": weather.get("temperature"),
        "humidity": weather.get("humidity"),
    })
    return document