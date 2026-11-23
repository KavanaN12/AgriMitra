import os
from typing import Optional
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.db.seed import seed_database

# Routers
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.locations import router as locations_router
from app.api.crops import router as crops_router
from app.api.weather import router as weather_router
from app.api.advisory import router as advisory_router
from app.api.community import router as community_router
from app.api.market import router as market_router
from app.api.notifications import router as notifications_router
from app.api.profile import router as profile_router
from app.api.support import router as support_router
from app.api.admin import router as admin_router

from contextlib import asynccontextmanager

# Lifespan event: create tables & seed initial Mandya data
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    print(f"INFO: Frontend dist resolved to: {frontend_dist}")
    yield

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multilingual Rural Agricultural Platform API for Mandya pilot (Kannada & English).",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Health router at root /health as well as /api/v1/health
app.include_router(health_router, prefix="")
app.include_router(health_router, prefix=settings.API_V1_STR)

# Mount Business API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(locations_router, prefix=settings.API_V1_STR)
app.include_router(crops_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(advisory_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)
app.include_router(market_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(support_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

# Persistent Uploads Storage (Non-ephemeral)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Bundled Frontend Support (Production Single-Container Mode)
def resolve_frontend_dist() -> Optional[str]:
    candidates = [
        getattr(settings, "FRONTEND_DIST_DIR", None),
        os.getenv("FRONTEND_DIST_DIR"),
        "/app/static",
        "/app/dist",
        "/app/static/dist",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist"),
        os.path.join(os.getcwd(), "static"),
        os.path.join(os.getcwd(), "frontend", "dist"),
        os.path.join(os.getcwd(), "dist"),
    ]
    for candidate in candidates:
        if candidate and os.path.isdir(candidate):
            idx = os.path.join(candidate, "index.html")
            if os.path.isfile(idx):
                return os.path.abspath(candidate)
            nested_idx = os.path.join(candidate, "dist", "index.html")
            if os.path.isfile(nested_idx):
                return os.path.abspath(os.path.join(candidate, "dist"))
    return None

frontend_dist = resolve_frontend_dist()

if frontend_dist:
    index_file = os.path.join(frontend_dist, "index.html")
    
    # Mount assets folder (/assets)
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Mount images folder (/images) for crop photographs and UI assets
    images_dir = os.path.join(frontend_dist, "images")
    if os.path.isdir(images_dir):
        app.mount("/images", StaticFiles(directory=images_dir), name="images")

    # Explicit root route -> serves React SPA index.html
    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(index_file)

    # SPA catch-all route for client-side routing & root static files
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        clean_path = full_path.lstrip("/")
        # Never intercept API, health, uploads, or docs routes
        if (
            clean_path.startswith("api/")
            or clean_path == "api"
            or clean_path.startswith("uploads/")
            or clean_path in ["docs", "redoc", "openapi.json", "health"]
        ):
            return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
        
        # Check if the requested file exists in frontend_dist
        target_file = os.path.join(frontend_dist, clean_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        
        # Fall back to index.html for client-side routing
        return FileResponse(index_file)
else:
    @app.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
