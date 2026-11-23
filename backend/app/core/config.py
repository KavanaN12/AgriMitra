import os
import json
from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriMitra API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./agrimitra.db"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://agrimitra.onrender.com",
        "https://agrimitra-app.onrender.com",
        "https://agrimitra-7nj1.onrender.com"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "https://agrimitra.onrender.com",
            "https://agrimitra-app.onrender.com",
            "https://agrimitra-7nj1.onrender.com"
        ]
        if isinstance(v, str):
            v_clean = v.strip()
            if not v_clean:
                return default_origins
            if v_clean.startswith("[") and v_clean.endswith("]"):
                try:
                    parsed = json.loads(v_clean)
                    if isinstance(parsed, list):
                        return [str(i).strip() for i in parsed if str(i).strip()]
                except Exception:
                    pass
            items = [i.strip() for i in v_clean.split(",") if i.strip()]
            return items if items else default_origins
        elif isinstance(v, list):
            items = [str(i).strip() for i in v if str(i).strip()]
            return items if items else default_origins
        return default_origins
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "agrimitra-insecure-development-secret-key-change-in-prod-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7))) # 7 days

    # Initial Administrator Bootstrap
    ADMIN_INITIAL_PHONE: str = os.getenv("ADMIN_INITIAL_PHONE", "9845000000")
    ADMIN_INITIAL_PASSWORD: str = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin@123")
    ADMIN_INITIAL_EMAIL: str = os.getenv("ADMIN_INITIAL_EMAIL", "admin@agrimitra.gov.in")
    ADMIN_FULL_NAME: str = os.getenv("ADMIN_FULL_NAME", "Mandya Krishi Admin")
    
    # SMTP / External Mail Provider Configuration (Optional - for real email verification & password reset)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@agrimitra.gov.in")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "AgriMitra Platform")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")

    # SMS Gateway Provider Configuration (e.g. CDAC / Fast2SMS)
    SMS_GATEWAY_URL: Optional[str] = os.getenv("SMS_GATEWAY_URL", None)
    SMS_GATEWAY_API_KEY: Optional[str] = os.getenv("SMS_GATEWAY_API_KEY", None)
    
    FRONTEND_DIST_DIR: str = os.getenv(
        "FRONTEND_DIST_DIR", 
        "/app/static" if os.path.isdir("/app/static") else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "frontend", "dist")
    )

    @field_validator("FRONTEND_DIST_DIR", mode="before")
    @classmethod
    def normalize_frontend_dist(cls, v: Optional[str]) -> str:
        if v and isinstance(v, str) and v.strip():
            return v.strip()
        if os.path.isdir("/app/static"):
            return "/app/static"
        return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "frontend", "dist")
    
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
