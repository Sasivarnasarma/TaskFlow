from datetime import UTC, datetime, timedelta
from typing import cast

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.models.user import TokenBlacklist, User
from app.schemas.user import UserCreate, UserLogin, UserRecovery
from app.services.auth import (
    create_access_token,
    generate_recovery_key,
    get_current_user,
    hash_secret,
    security,
    validate_password_strength,
    verify_secret,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=None, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if not settings.ALLOW_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is disabled by administrator",
        )

    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    validate_password_strength(user_data.password)

    # Check if username already exists
    existing = db.query(User).filter(User.username == user_data.username.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken",
        )

    recovery_key = generate_recovery_key()
    hashed_password = hash_secret(user_data.password)
    hashed_recovery_key = hash_secret(recovery_key)

    new_user = User(
        username=user_data.username.strip(),
        hashed_password=hashed_password,
        hashed_recovery_key=hashed_recovery_key,
    )

    db.add(new_user)
    db.commit()

    return {
        "success": True,
        "data": {"recovery_key": recovery_key},
        "error": None,
    }


@router.post("/login", response_model=None)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username.strip()).first()
    if not user or not verify_secret(str(user.hashed_password), login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(cast(int, user.id), cast(int, user.session_version))

    return {
        "success": True,
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": cast(int, user.id),
                "username": user.username,
                "created_at": user.created_at,
            },
        },
        "error": None,
    }


@router.post("/recover", response_model=None)
def recover(recovery_data: UserRecovery, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == recovery_data.username.strip()).first()
    if not user or not verify_secret(str(user.hashed_recovery_key), recovery_data.recovery_key.strip()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or recovery key",
        )

    if recovery_data.new_password != recovery_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    validate_password_strength(recovery_data.new_password)

    # Invalidate current session and generate a new recovery key
    user.session_version = cast(int, user.session_version) + 1  # type: ignore
    new_recovery_key = generate_recovery_key()

    user.hashed_password = hash_secret(recovery_data.new_password)  # type: ignore
    user.hashed_recovery_key = hash_secret(new_recovery_key)  # type: ignore

    db.commit()

    return {
        "success": True,
        "data": {"recovery_key": new_recovery_key},
        "error": None,
    }


@router.post("/logout", response_model=None)
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if credentials:
        token = credentials.credentials

        # Get exp from token to avoid storing blacklisted tokens forever
        expires_at = None
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                expires_at = datetime.fromtimestamp(exp_timestamp, tz=UTC)
        except Exception:
            pass

        if not expires_at:
            expires_at = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        # Clean up any expired blacklisted tokens to prevent database bloat
        db.query(TokenBlacklist).filter(TokenBlacklist.expires_at < datetime.now(UTC)).delete()

        # Add to blacklist if not already blacklisted
        existing = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
        if not existing:
            blacklist_entry = TokenBlacklist(token=token, expires_at=expires_at)
            db.add(blacklist_entry)
            db.commit()

    return {
        "success": True,
        "data": "Logged out successfully",
        "error": None,
    }
