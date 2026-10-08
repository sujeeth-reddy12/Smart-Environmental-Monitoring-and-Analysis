from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=256)


class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    created_at: datetime


class PredictionCreate(BaseModel):
    user_id: str
    input_environmental_parameters: dict[str, float] = Field(default_factory=dict)
    predicted_value: float
    environmental_status: str
    threshold_status: str


class EnvironmentalDataCreate(BaseModel):
    location: str = Field(min_length=1, max_length=120)
    environmental_parameters: dict[str, Any] = Field(default_factory=dict)
    aqi: float | None = None
    other_values: dict[str, Any] = Field(default_factory=dict)
