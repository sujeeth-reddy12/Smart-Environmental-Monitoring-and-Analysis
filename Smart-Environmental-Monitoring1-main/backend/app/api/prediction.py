"""FastAPI routes for AQI prediction APIs."""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.services.prediction_service import (
    PredictorError,
    get_complete_prediction,
    get_current_prediction,
    get_forecast_prediction,
)
from app.database.mongodb import ENVIRONMENTAL_DATA_COLLECTION, PREDICTIONS_COLLECTION, get_database
from app.models.schemas import PredictionCreate
from app.utils.security import get_optional_current_user


router = APIRouter(
	prefix="/prediction",
	tags=["Prediction"],
)


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_prediction(payload: PredictionCreate):
	"""Persist a prediction and its environmental status in MongoDB."""
	database = get_database()
	if database is None:
		raise HTTPException(status_code=503, detail="Database is not initialized")
	if not ObjectId.is_valid(payload.user_id):
		raise HTTPException(status_code=422, detail="user_id must be a valid MongoDB ObjectId")

	document = payload.model_dump(exclude={"user_id"})
	document["user_id"] = ObjectId(payload.user_id)
	document["timestamp"] = datetime.now(timezone.utc)
	result = await database[PREDICTIONS_COLLECTION].insert_one(document)
	return {"id": str(result.inserted_id), "message": "Prediction saved"}


@router.get("/history")
async def prediction_history(current_user: dict | None = Depends(get_optional_current_user), limit: int = 20):
	"""Return saved real-time predictions from MongoDB database."""
	database = get_database()
	if database is None:
		raise HTTPException(status_code=503, detail="Database is not initialized")
	limit = max(1, min(limit, 100))

	documents = []
	if current_user and "_id" in current_user:
		user_obj_id = current_user["_id"] if isinstance(current_user["_id"], ObjectId) else ObjectId(current_user["_id"])
		documents = await database[PREDICTIONS_COLLECTION].find(
			{"user_id": user_obj_id}
		).sort("timestamp", -1).limit(limit).to_list(length=limit)

	if not documents:
		documents = await database[PREDICTIONS_COLLECTION].find(
			{}
		).sort("timestamp", -1).limit(limit).to_list(length=limit)

	if not documents:
		# Fallback to environmental_data collection records if predictions collection is empty
		env_docs = await database[ENVIRONMENTAL_DATA_COLLECTION].find(
			{}
		).sort("collected_at", -1).limit(limit).to_list(length=limit)

		for doc in env_docs:
			air = doc.get("air_quality", {})
			documents.append({
				"_id": str(doc.get("_id", "")),
				"user_id": None,
				"timestamp": doc.get("collected_at", datetime.now(timezone.utc).isoformat()),
				"location": doc.get("city", "Hyderabad"),
				"input_environmental_parameters": {
					"pm25": air.get("pm25", 0.0),
					"pm10": air.get("pm10", 0.0),
					"co": air.get("co", 0.0),
					"no2": air.get("no2", 0.0),
					"so2": air.get("so2", 0.0),
					"o3": air.get("o3", 0.0),
				},
				"predicted_value": air.get("aqi", 75),
				"environmental_status": "Good" if air.get("aqi", 75) <= 50 else ("Moderate" if air.get("aqi", 75) <= 100 else "Poor"),
				"threshold_status": "Project Limits Compliant",
			})
		return documents

	for document in documents:
		document["_id"] = str(document["_id"])
		if "user_id" in document and document["user_id"]:
			document["user_id"] = str(document["user_id"])
		else:
			document["user_id"] = None

		if "timestamp" in document and document["timestamp"]:
			ts = document["timestamp"]
			if isinstance(ts, datetime):
				if ts.tzinfo is None:
					ts = ts.replace(tzinfo=timezone.utc)
				document["timestamp"] = ts.isoformat()
			elif isinstance(ts, str):
				if not ts.endswith("Z") and "+" not in ts:
					document["timestamp"] = ts + "Z"
	return documents



@router.get("/all")
async def complete_prediction(city: str, current_user: dict | None = Depends(get_optional_current_user)):
	"""Return current and forecast AQI predictions for a city, and save entry to history."""

	try:
		prediction_data = await get_complete_prediction(city)

		# Save to predictions collection in MongoDB
		database = get_database()
		if database is not None and isinstance(prediction_data, dict):
			pollutants = prediction_data.get("pollutants", {})
			user_id_val = None
			if current_user and "_id" in current_user:
				user_id_val = current_user["_id"] if isinstance(current_user["_id"], ObjectId) else ObjectId(current_user["_id"])

			document = {
				"user_id": user_id_val,
				"location": prediction_data.get("city", city),
				"timestamp": datetime.now(timezone.utc),
				"input_environmental_parameters": {
					"pm25": pollutants.get("PM2.5", 0.0),
					"pm10": pollutants.get("PM10", 0.0),
					"co": pollutants.get("CO", 0.0),
					"no2": pollutants.get("NO2", 0.0),
					"so2": pollutants.get("SO2", 0.0),
					"o3": pollutants.get("O3", 0.0),
				},
				"predicted_value": prediction_data.get("current_aqi", 0.0),
				"environmental_status": prediction_data.get("aqi_category", "Satisfactory"),
				"threshold_status": "Project Limits Compliant",
				"prediction_type": "ai_aqi_forecast",
			}
			await database[PREDICTIONS_COLLECTION].insert_one(document)

		return prediction_data
	except PredictorError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=str(exc),
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(exc),
		)



@router.get("/current")
async def current_prediction(city: str):
	"""Return the current AQI prediction for a city."""

	# Keep the API layer thin and delegate all prediction work to the service.
	try:
		return await get_current_prediction(city)
	except PredictorError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=str(exc),
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(exc),
		)


@router.get("/forecast")
async def forecast_prediction(city: str):
	"""Return the AQI forecast prediction for a city."""

	# Keep the API layer thin and delegate all prediction work to the service.
	try:
		return await get_forecast_prediction(city)
	except PredictorError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=str(exc),
		)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(exc),
		)
