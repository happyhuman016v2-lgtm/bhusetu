"""
BhuSetu GovTech Security & RBAC Service
Implements:
- Bcrypt password hashing (salt rounds >= 12)
- Short-lived JWT Access Tokens (15 min) + Refresh Tokens (7 days)
- Role-Based Access Control (RBAC): CITIZEN and REVENUE_OFFICER
- Rate limiting for auth attempts
"""

import os
import time
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

logger = logging.getLogger("BhuSetu_Auth")

JWT_SECRET_KEY = os.getenv("BHUSETU_JWT_SECRET", "bhusetu-govtech-super-secret-key-2026-production-salt-98765")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# In-memory rate limiting store: ip -> list of failed timestamp floats
_FAILED_LOGIN_ATTEMPTS: Dict[str, List[float]] = {}
MAX_FAILED_ATTEMPTS_PER_MIN = 5


def hash_password(plain_password: str) -> str:
    """Hash password using bcrypt with salt rounds >= 12."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived JWT access token (15 mins default)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access"
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a refresh token (7 days expiry)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "refresh"
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {str(e)}")


def check_rate_limit(client_ip: str) -> bool:
    """
    Check if client IP has exceeded maximum failed login attempts (5 / min).
    Returns True if allowed, False if rate limited.
    """
    now = time.time()
    one_min_ago = now - 60.0
    attempts = _FAILED_LOGIN_ATTEMPTS.get(client_ip, [])
    # Filter attempts in last 60 seconds
    attempts = [t for t in attempts if t > one_min_ago]
    _FAILED_LOGIN_ATTEMPTS[client_ip] = attempts

    return len(attempts) < MAX_FAILED_ATTEMPTS_PER_MIN


def record_failed_attempt(client_ip: str):
    """Record a failed login attempt for the client IP."""
    now = time.time()
    attempts = _FAILED_LOGIN_ATTEMPTS.get(client_ip, [])
    attempts.append(now)
    _FAILED_LOGIN_ATTEMPTS[client_ip] = attempts


def reset_failed_attempts(client_ip: str):
    """Clear failed attempts on successful login."""
    if client_ip in _FAILED_LOGIN_ATTEMPTS:
        del _FAILED_LOGIN_ATTEMPTS[client_ip]


# --- SEED USERS DATABASE ---
# Pre-computed bcrypt hashes with 12 salt rounds
_OFFICER_HASH = hash_password("Officer@BhuSetu2026!")
_PATWARI_HASH = hash_password("Patwari@BhuSetu2026!")
_CITIZEN_HASH = hash_password("Citizen@BhuSetu2026!")

USERS_DB: Dict[str, Dict[str, Any]] = {
    "officer@bhusetu.gov.in": {
        "email": "officer@bhusetu.gov.in",
        "hashed_password": _OFFICER_HASH,
        "full_name": "Thiru M. Shanmugavel, M.A.",
        "role": "REVENUE_OFFICER",
        "badge_id": "REV-OFF-UP-042",
        "designation": "Tahsildar / Sub-Divisional Magistrate",
        "jurisdiction": "Tehsil Bakshi Ka Talab, District Lucknow, UP",
        "is_active": True
    },
    "patwari@bhusetu.gov.in": {
        "email": "patwari@bhusetu.gov.in",
        "hashed_password": _PATWARI_HASH,
        "full_name": "Rameshwar Nath Shukla",
        "role": "REVENUE_OFFICER",
        "badge_id": "PAT-LKO-014",
        "designation": "Revenue Inspector / Patwari",
        "jurisdiction": "Halka Rampur Kalan, UP",
        "is_active": True
    },
    "citizen@bhusetu.gov.in": {
        "email": "citizen@bhusetu.gov.in",
        "hashed_password": _CITIZEN_HASH,
        "full_name": "Ramesh Kumar Verma",
        "role": "CITIZEN",
        "badge_id": None,
        "designation": "Registered Landowner / Citizen",
        "jurisdiction": "Village Rampur Kalan",
        "is_active": True
    }
}


def authenticate_user(email: str, password: str, client_ip: str) -> Optional[Dict[str, Any]]:
    """Authenticate user credentials with rate limit validation."""
    if not check_rate_limit(client_ip):
        raise PermissionError("Rate limit exceeded: Too many failed login attempts. Please try again in 1 minute.")

    user = USERS_DB.get(email.lower().strip())
    if not user:
        record_failed_attempt(client_ip)
        return None

    if not verify_password(password, user["hashed_password"]):
        record_failed_attempt(client_ip)
        return None

    reset_failed_attempts(client_ip)
    return user
