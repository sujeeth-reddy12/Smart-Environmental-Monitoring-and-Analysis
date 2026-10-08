from pydantic import BaseModel, Field
from typing import Any


class AQIResponse(BaseModel):
    city: str
    aqi: float | None = None
    pm25: float | None = None
    pm10: float | None = None
    co: float | None = None
    no2: float | None = None
    so2: float | None = None
    o3: float | None = None
    nh3: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    timestamp: str
    source: str = "live_api"
    field_status: dict[str, str] = Field(default_factory=dict)