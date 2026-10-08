"""
Authentication & RBAC Routes for BhuSetu Platform
Endpoints:
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me
- Dependencies: get_current_user, verify_officer
"""

import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field

from services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    USERS_DB
)

logger = logging.getLogger("BhuSetu_AuthRoutes")
router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    email: str
    full_name: str
    role: str
    badge_id: Optional[str] = None
    designation: str
    jurisdiction: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in_minutes: int = 15
    user: UserProfile


def get_client_ip(request: Request) -> str:
    """Extract client IP handling proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Dependency: Extract and validate user from Bearer JWT token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(credentials.credentials)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email or email not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in authorized directory.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = USERS_DB[email]
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or inactive."
        )

    return user


def verify_officer(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    RBAC Middleware Dependency: Enforces that the caller is an authorized REVENUE_OFFICER.
    Rejects CITIZEN and unauthorized users with HTTP 403 Forbidden.
    """
    if current_user.get("role") != "REVENUE_OFFICER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Route requires verified REVENUE_OFFICER statutory privileges."
        )
    return current_user


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, response: Response):
    """
    Authenticate user with bcrypt password verification and rate limiting (max 5 fails/min).
    Returns short-lived Access Token (15m) + Refresh Token (7d).
    """
    client_ip = get_client_ip(request)

    try:
        user = authenticate_user(req.email, req.password, client_ip)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Check email and password."
        )

    token_payload = {
        "sub": user["email"],
        "role": user["role"],
        "name": user["full_name"],
        "badge_id": user.get("badge_id")
    }

    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    # Set secure HttpOnly cookie for refresh token
    response.set_cookie(
        key="bhusetu_refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 3600
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserProfile(
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            badge_id=user.get("badge_id"),
            designation=user["designation"],
            jurisdiction=user["jurisdiction"]
        )
    )


@router.post("/refresh")
def refresh_token(req: RefreshRequest):
    """Issue fresh access token using a valid refresh token."""
    try:
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    email = payload.get("sub")
    user = USERS_DB.get(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User does not exist.")

    token_payload = {
        "sub": user["email"],
        "role": user["role"],
        "name": user["full_name"],
        "badge_id": user.get("badge_id")
    }

    new_access_token = create_access_token(token_payload)
    return {
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in_minutes": 15
    }


@router.get("/me", response_model=UserProfile)
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return UserProfile(
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        badge_id=user.get("badge_id"),
        designation=user["designation"],
        jurisdiction=user["jurisdiction"]
    )
