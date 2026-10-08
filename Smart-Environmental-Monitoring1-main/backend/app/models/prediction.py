from pydantic import BaseModel, ConfigDict, Field


class PredictRequest(BaseModel):
    """The exact six features used by the trained AQI regression model."""

    model_config = ConfigDict(extra="forbid")

    pm25: float = Field(ge=0)
    pm10: float = Field(ge=0)
    co: float = Field(ge=0)
    no2: float = Field(ge=0)
    so2: float = Field(ge=0)
    o3: float = Field(ge=0)


class PredictResponse(BaseModel):
    prediction: float
    status: str
    threshold_status: str
