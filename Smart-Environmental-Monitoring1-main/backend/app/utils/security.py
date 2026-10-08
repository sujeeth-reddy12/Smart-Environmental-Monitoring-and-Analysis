import base64
import hashlib
import hmac
import os
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.mongodb import SESSIONS_COLLECTION, USERS_COLLECTION, get_database


_ITERATIONS = 210_000
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _ITERATIONS
    )
    encoded_salt = base64.b64encode(salt).decode("ascii")
    encoded_digest = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${_ITERATIONS}${encoded_salt}${encoded_digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, encoded_salt, encoded_digest = password_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(encoded_salt)
        expected_digest = base64.b64decode(encoded_digest)
        actual_digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, int(iterations)
        )
        return hmac.compare_digest(actual_digest, expected_digest)
    except (ValueError, TypeError):
        return False


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    database = get_database()
    if database is None:
        raise HTTPException(status_code=503, detail="Database is not initialized")

    session = await database[SESSIONS_COLLECTION].find_one(
        {
            "token_hash": hash_session_token(credentials.credentials),
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        }
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    user = await database[USERS_COLLECTION].find_one({"_id": session["user_id"]})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None

    database = get_database()
    if database is None:
        return None

    session = await database[SESSIONS_COLLECTION].find_one(
        {
            "token_hash": hash_session_token(credentials.credentials),
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        }
    )
    if session is None:
        return None

    user = await database[USERS_COLLECTION].find_one({"_id": session["user_id"]})
    return user

