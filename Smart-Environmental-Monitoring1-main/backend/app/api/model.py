from pathlib import Path

import joblib
from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/model", tags=["Model"])
MODEL_DIR = Path(__file__).resolve().parents[3] / "ml" / "models"


@router.get("/comparison")
@router.get("/metrics")
async def model_comparison():
    try:
        info = joblib.load(MODEL_DIR / "feature_info.pkl")
        return {
            "selected_model": info["selected_model"],
            "features": info["features"],
            "target": info["target"],
            "metrics": info["metrics"],
        }
    except (FileNotFoundError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Model comparison artifacts are unavailable") from exc


@router.get("/info")
async def model_info():
    try:
        info = joblib.load(MODEL_DIR / "feature_info.pkl")
        return {
            "features": info["features"],
            "target": info["target"],
            "problem_type": info["problem_type"],
            "selected_model": info["selected_model"],
        }
    except (FileNotFoundError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Model information is unavailable") from exc