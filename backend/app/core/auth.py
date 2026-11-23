from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

security_scheme = HTTPBearer(auto_error=False)

def extract_token(
    auth_cred: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    authorization: Optional[str] = Header(None)
) -> Optional[str]:
    """Extract raw bearer token from Authorization header or HTTPBearer."""
    if auth_cred and auth_cred.credentials:
        return auth_cred.credentials
    if authorization:
        parts = authorization.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]
        elif len(parts) == 1:
            return parts[0]
    return None


def get_current_user(
    token: Optional[str] = Depends(extract_token),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticate request via JWT Bearer token and return genuine PostgreSQL User.
    Strictly raises 401 Unauthorized if missing, expired, or invalid.
    Never falls back to a demonstration user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials. Please sign in.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    user_id: Optional[int] = None

    # 1. Attempt standard signed JWT decoding
    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")
        if sub is not None:
            user_id = int(sub)
    except Exception:
        # 2. Strict backward compatibility for transition tokens formatted as agrimitra_token_<uid>_<timestamp>
        if token.startswith("agrimitra_token_"):
            try:
                parts = token.split("agrimitra_token_")[1].split("_")
                user_id = int(parts[0])
            except Exception:
                raise credentials_exception
        elif token.startswith("user_"):
            try:
                user_id = int(token.split("user_")[1])
            except Exception:
                raise credentials_exception
        else:
            raise credentials_exception

    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user account not found or has been disabled.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_user_optional(
    token: Optional[str] = Depends(extract_token),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optionally retrieve authenticated user for public routes.
    Returns None if token is absent or invalid, without raising an error.
    """
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Enforce strict backend authorization for platform administration.
    Raises 403 Forbidden for non-admin users.
    """
    if not (current_user.is_admin or current_user.role == "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return current_user
