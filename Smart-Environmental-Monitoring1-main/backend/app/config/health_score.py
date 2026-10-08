"""Transparent, project-defined Environmental Health Score methodology."""

from typing import Mapping

# Weights are applied only to parameters present in the observation.
HEALTH_SCORE_WEIGHTS = {
    "aqi": 0.35,
    "pm25": 0.20,
    "pm10": 0.15,
    "co": 0.08,
    "no2": 0.08,
    "so2": 0.05,
    "o3": 0.05,
    "temperature": 0.02,
    "humidity": 0.02,
}

# Project-defined normalization limits. These are not regulatory limits.
POLLUTION_UPPER_LIMITS = {
    "aqi": 200.0,
    "pm25": 55.0,
    "pm10": 100.0,
    "co": 20000.0,
    "no2": 80.0,
    "so2": 80.0,
    "o3": 180.0,
}


def _parameter_score(name: str, value: float) -> float:
    if name == "temperature":
        deviation = max(0.0, abs(value - 25.0) - 7.0)
        return max(0.0, 1.0 - deviation / 25.0)
    if name == "humidity":
        deviation = max(0.0, abs(value - 50.0) - 20.0)
        return max(0.0, 1.0 - deviation / 50.0)
    upper_limit = POLLUTION_UPPER_LIMITS[name]
    return max(0.0, min(1.0, 1.0 - value / upper_limit))


def calculate_health_score(parameters: Mapping[str, float | None]) -> dict:
    available = {
        name: float(value)
        for name, value in parameters.items()
        if name in HEALTH_SCORE_WEIGHTS and value is not None
    }
    if not available:
        return {"score": None, "status": "Not Available", "contributors": [], "available_parameters": []}

    total_weight = sum(HEALTH_SCORE_WEIGHTS[name] for name in available)
    weighted_score = sum(
        _parameter_score(name, value) * HEALTH_SCORE_WEIGHTS[name]
        for name, value in available.items()
    )
    score = round(100.0 * weighted_score / total_weight)
    if score >= 85:
        status = "Excellent"
    elif score >= 70:
        status = "Good"
    elif score >= 50:
        status = "Moderate"
    elif score >= 25:
        status = "Poor"
    else:
        status = "Critical"

    impacts = sorted(
        ((name, round((1.0 - _parameter_score(name, value)) * HEALTH_SCORE_WEIGHTS[name], 4)) for name, value in available.items()),
        key=lambda item: item[1],
        reverse=True,
    )
    return {
        "score": score,
        "status": status,
        "contributors": [name for name, impact in impacts if impact > 0][:3],
        "available_parameters": list(available),
    }
