from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
import pandas as pd

from app.config.thresholds import analyze_thresholds
from app.database.mongodb import PREDICTIONS_COLLECTION, get_database
from app.models.prediction import PredictRequest, PredictResponse
from app.utils.security import get_optional_current_user
from ml.predictor import AQI_MODEL, FEATURE_NAMES


router = APIRouter(tags=["Real-time Prediction"])


@router.post("/predict", response_model=PredictResponse)
async def predict_realtime(
    payload: PredictRequest,
    current_user: dict | None = Depends(get_optional_current_user),
):
    """Predict AQI from the exact environmental features used during training."""
    parameters = payload.model_dump()
    model_input = {
        "PM2.5": parameters["pm25"],
        "PM10": parameters["pm10"],
        "CO": parameters["co"],
        "NO2": parameters["no2"],
        "SO2": parameters["so2"],
        "O3": parameters["o3"],
    }
    missing_features = [feature for feature in FEATURE_NAMES if feature not in model_input]
    if missing_features:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model features are not supported by the request adapter: {missing_features}",
        )

    ordered_input = {feature: model_input[feature] for feature in FEATURE_NAMES}
    prediction_frame = pd.DataFrame([ordered_input], columns=FEATURE_NAMES)
    prediction = float(AQI_MODEL.predict(prediction_frame)[0])
    analysis_parameters = {name: parameters[name] for name in parameters}
    environmental_status, threshold_status = analyze_thresholds(
        analysis_parameters, prediction
    )

    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")

    user_id_val = None
    if current_user and "_id" in current_user:
        user_id_val = current_user["_id"] if isinstance(current_user["_id"], ObjectId) else ObjectId(current_user["_id"])

    document = {
        "user_id": user_id_val,
        "timestamp": datetime.now(timezone.utc),
        "input_environmental_parameters": parameters,
        "predicted_value": prediction,
        "environmental_status": environmental_status,
        "threshold_status": threshold_status,
        "prediction_type": "real_time_aqi",
    }
    await database[PREDICTIONS_COLLECTION].insert_one(document)


    return PredictResponse(
        prediction=prediction,
        status=environmental_status,
        threshold_status=threshold_status,
    )
