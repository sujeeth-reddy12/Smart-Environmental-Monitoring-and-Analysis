"""Project-defined threshold policy for real-time environmental analysis.

These values are application policy defaults for dashboard status labels. They
are not official environmental or regulatory limits and should be reviewed by
an environmental domain expert before operational use.
"""

from typing import Mapping

# Project-defined live-API pollutant thresholds. OpenWeather pollutant values
# are evaluated in micrograms per cubic metre (µg/m³). These are application
# policy values, not official environmental or regulatory limits.
POLLUTANT_THRESHOLDS: Mapping[str, tuple[float, float]] = {
    "pm25": (35.0, 55.0),
    "pm10": (60.0, 100.0),
    "co": (10000.0, 20000.0),
    "no2": (40.0, 80.0),
    "so2": (40.0, 80.0),
    "o3": (100.0, 180.0),
}

# Project-defined AQI status thresholds.
AQI_THRESHOLDS: tuple[float, float] = (100.0, 200.0)

SAFETY_MEASURES = {
    "Normal": [],
    "Warning": [
        "Reduce prolonged outdoor exposure.",
        "Avoid strenuous outdoor exercise during peak pollution periods.",
        "People with asthma or heart/lung conditions should keep prescribed medication available.",
    ],
    "Critical": [
        "Avoid outdoor activity unless essential.",
        "Wear a well-fitted N95/KN95 mask when going outside.",
        "Keep windows closed and use indoor air filtration if available.",
        "Vulnerable people should remain indoors and seek medical advice for symptoms.",
    ],
}


def classify_value(value: float, thresholds: tuple[float, float]) -> str:
    warning_limit, critical_limit = thresholds
    if value >= critical_limit:
        return "Critical"
    if value >= warning_limit:
        return "Warning"
    return "Normal"


def analyze_thresholds(parameters: Mapping[str, float], prediction: float) -> tuple[str, str]:
    statuses = [
        classify_value(parameters[name], thresholds)
        for name, thresholds in POLLUTANT_THRESHOLDS.items()
        if name in parameters
    ]
    statuses.append(classify_value(prediction, AQI_THRESHOLDS))
    severity = {"Normal": 0, "Warning": 1, "Critical": 2}
    status = max(statuses, key=lambda value: severity[value])
    threshold_status = "Within Limit" if status == "Normal" else "Above Project Threshold"
    return status, threshold_status


def safety_measures(status: str) -> list[str]:
    return list(SAFETY_MEASURES.get(status, []))
