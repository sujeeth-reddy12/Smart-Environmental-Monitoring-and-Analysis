from fastapi import APIRouter
from app.database.mongodb import ENVIRONMENTAL_DATA_COLLECTION, get_database
from app.services.environment_service import get_latest_environment
from app.services.aqi_service import collect_and_store_environmental_data
from app.integrations.geocoding import get_coordinates
from app.utils.security import get_current_user
from fastapi import Depends, HTTPException

router = APIRouter(
    prefix="/environment",
    tags=["Environment"]
)

@router.get("/latest")
async def latest_environment(city: str):
    document = await get_latest_environment(city)
    if document is None:
        raise HTTPException(status_code=404, detail=f"No environmental data found for {city}")
    return document


@router.get("/current")
async def current_environment(city: str):
    return await latest_environment(city)


@router.post("/refresh")
async def refresh_environment(city: str):
    inserted_id = await collect_and_store_environmental_data(city)
    if inserted_id is None:
        raise HTTPException(status_code=503, detail="Live environmental data is temporarily unavailable")
    return {"message": "Live environmental data refreshed", "id": inserted_id}


@router.get("/history")
async def environmental_history(city: str, limit: int = 50, current_user: dict = Depends(get_current_user)):
    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")
    limit = max(1, min(limit, 100))
    documents = await database[ENVIRONMENTAL_DATA_COLLECTION].find(
        {"city": {"$regex": f"^{city.strip()}$", "$options": "i"}}
    ).sort("collected_at", -1).limit(limit).to_list(length=limit)
    for document in documents:
        document["_id"] = str(document["_id"])
    return documents