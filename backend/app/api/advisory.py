from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.auth import get_current_user_optional
from app.models.models import AdvisoryItem, User, UserCrop
from app.schemas.schemas import (
    AdvisoryItemResponse,
    AdvisoryRecommendation,
    DiseaseDiagnosisRequest,
    DiseaseDiagnosisResponse
)
from app.services.weather_service import weather_service
from app.services.advisory_engine import advisory_engine

router = APIRouter(prefix="/advisory", tags=["Smart Crop Advisory"])

@router.get("", response_model=List[AdvisoryItemResponse], summary="List active crop & weather advisories with filters")
def get_advisories(
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (info, warning, critical)"),
    category: Optional[str] = Query(None, description="Filter by category (pest, disease, weather, irrigation, fertilizer)"),
    search: Optional[str] = Query(None, description="Search in advisory title or message"),
    db: Session = Depends(get_db)
):
    # Handle direct positional call in unit tests
    if isinstance(crop_id, Session):
        db = crop_id
        crop_id = None
        severity = None
        category = None
        search = None

    query = db.query(AdvisoryItem)
    if isinstance(crop_id, int):
        query = query.filter(AdvisoryItem.crop_id == crop_id)
    if isinstance(severity, str):
        query = query.filter(AdvisoryItem.severity == severity)
    if isinstance(category, str):
        query = query.filter(AdvisoryItem.category == category)
    if isinstance(search, str):
        s = f"%{search}%"
        query = query.filter(
            or_(
                AdvisoryItem.title_en.ilike(s),
                AdvisoryItem.title_kn.ilike(s),
                AdvisoryItem.message_en.ilike(s),
                AdvisoryItem.message_kn.ilike(s)
            )
        )
    return query.order_by(AdvisoryItem.created_at.desc()).all()

@router.get("/recommendations", response_model=List[AdvisoryRecommendation], summary="Generate dynamic personalized agronomic recommendations")
def get_recommendations(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Generate agronomic recommendations customized to the authenticated user's
    actual crops and taluk location.
    """
    if not isinstance(current_user, User):
        current_user = None
    user_crops = []
    if current_user:
        user_crops = db.query(UserCrop).filter(UserCrop.user_id == current_user.id).all()

    taluk = current_user.location.taluk if current_user and current_user.location else "Mandya"
    lat, lon = weather_service.get_coordinates_for_location(taluk)

    current_w = weather_service.get_current_weather(lat, lon)
    forecast_days = weather_service.get_forecast(lat, lon, days=7)

    return advisory_engine.generate_recommendations(
        user=current_user,
        user_crops=user_crops,
        current_weather=current_w,
        forecast_days=forecast_days
    )

@router.post("/diagnose", response_model=DiseaseDiagnosisResponse, summary="Preliminary AI crop disease assistant (educational preview)")
def diagnose_crop_disease(payload: DiseaseDiagnosisRequest):
    return advisory_engine.diagnose_disease_symptoms(
        crop_id=payload.crop_id,
        plant_part=payload.plant_part,
        symptoms=payload.symptoms,
        image_url=payload.image_url
    )

@router.get("/{id}", response_model=AdvisoryItemResponse, summary="Get advisory detail with explanation and sources")
def get_advisory_by_id(id: int, db: Session = Depends(get_db)):
    adv = db.query(AdvisoryItem).filter(AdvisoryItem.id == id).first()
    if not adv:
        raise HTTPException(status_code=404, detail="Advisory item not found")
    return adv
