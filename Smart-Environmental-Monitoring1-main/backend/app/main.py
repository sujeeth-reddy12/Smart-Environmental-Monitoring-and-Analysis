import app.utils.path_setup

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.aqi import router as aqi_router
from app.api.prediction import router as prediction_router
from app.api.predict import router as realtime_prediction_router
from app.api.model import router as model_router
from app.api.location import router as location_router
from app.api.analytics import router as analytics_router
from app.api.auth import login_user, register_user
from app.api.prediction import prediction_history
from app.models.schemas import UserCreate, UserLogin
from app.utils.security import get_current_user
from app.api.auth import router as auth_router
from app.api import environment

from app.database.mongodb import (
    connect_to_mongodb,
    close_mongodb_connection,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()

app = FastAPI(
    title="EcoPulse",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aqi_router)
app.include_router(prediction_router)
app.include_router(realtime_prediction_router)
app.include_router(model_router)
app.include_router(location_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(environment.router)


@app.get("/")
def root():
    return {"message": "EcoPulse Backend Running"}


@app.get("/health", tags=["System"])
def health():
    return {"status": "healthy"}


@app.post("/register", tags=["Authentication"])
async def register(payload: UserCreate):
    return await register_user(payload)


@app.post("/login", tags=["Authentication"])
async def login(payload: UserLogin):
    return await login_user(payload)


@app.get("/predictions", tags=["Prediction"])
async def predictions(limit: int = 20, current_user: dict = Depends(get_current_user)):
    return await prediction_history(current_user=current_user, limit=limit)