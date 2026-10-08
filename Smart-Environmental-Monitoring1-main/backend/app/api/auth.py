from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import SESSIONS_COLLECTION, USERS_COLLECTION, get_database
from app.models.schemas import UserCreate, UserLogin, UserResponse
from app.utils.security import (
    bearer_scheme,
    get_current_user,
    hash_password,
    hash_session_token,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _public_user(document: dict) -> UserResponse:
    return UserResponse(
        id=str(document["_id"]),
        name=document["name"],
        email=document["email"],
        created_at=document["created_at"],
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserCreate):
    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")

    email = payload.email.strip().lower()
    document = {
        "name": payload.name.strip(),
        "email": email,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await database[USERS_COLLECTION].insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email is already registered") from exc

    document["_id"] = result.inserted_id
    return _public_user(document)


@router.post("/login")
async def login_user(payload: UserLogin):
    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")

    document = await database[USERS_COLLECTION].find_one(
        {"email": payload.email.strip().lower()}
    )
    if document is None or not verify_password(payload.password, document["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session_token = secrets.token_urlsafe(32)
    await database[SESSIONS_COLLECTION].insert_one(
        {
            "user_id": document["_id"],
            "token_hash": hash_session_token(session_token),
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=12),
        }
    )
    return {"access_token": session_token, "token_type": "bearer", "user": _public_user(document)}


@router.post("/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Invalidate the current bearer session."""
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")

    await database[SESSIONS_COLLECTION].delete_one(
        {"token_hash": hash_session_token(credentials.credentials)}
    )
    return {"message": "Logout successful"}


@router.get("/me", response_model=UserResponse)
async def current_user(current_user: dict = Depends(get_current_user)):
    return _public_user(current_user)
