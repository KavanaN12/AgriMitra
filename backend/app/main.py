import os
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
frontend_dist = settings.FRONTEND_DIST_DIR
index_file = os.path.join(frontend_dist, "index.html")

if os.path.isdir(frontend_dist) and os.path.isfile(index_file):
    # Mount assets folder
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve PWA / static files if requested or fallback to index.html for SPA routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json", "health"]:
            return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
        
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(index_file)
else:
    @app.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
