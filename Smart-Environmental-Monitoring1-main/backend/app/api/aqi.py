from fastapi import APIRouter, HTTPException, status
from app.services.aqi_service import (
    get_latest_aqi,
    get_aqi_history,
    create_aqi,
    collect_and_store_environmental_data,
)
from app.models.aqi import AQIResponse

router = APIRouter(
    prefix="/aqi",
    tags=["AQI"]
)

@router.get("/latest", response_model=AQIResponse)
async def latest_aqi(city: str):
    data = await get_latest_aqi(city)

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"No AQI data found for {city}",
        )

    return data


@router.get("/history", response_model=list[AQIResponse])
async def history(
    city: str,
    limit: int = 50,
):
    return await get_aqi_history(city=city, limit=limit)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_aqi_endpoint(payload: AQIResponse):
    """Insert a new AQI record.

    Accepts an `AQIResponse` body, calls the async service `create_aqi`,
    and returns a JSON object containing a message and the inserted id.
    """
    try:
        inserted_id = await create_aqi(payload)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return {"message": "AQI data inserted successfully", "id": inserted_id}


@router.post("/collect", status_code=status.HTTP_201_CREATED)
async def collect_environmental_data_endpoint(city: str):
    """
    Collect live AQI and weather data from external APIs,
    standardize the data, and store it in MongoDB.
    """
    # Delegate collection and persistence to the service layer.
    inserted_id = await collect_and_store_environmental_data(city)

    # Convert any collection or storage failure into a server error response.
    if inserted_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to collect or store environmental data.",
        )

    return {"message": "Environmental data collected and stored successfully", "id": inserted_id}
