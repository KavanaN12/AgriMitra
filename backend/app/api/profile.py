from typing import Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User, Location, UserCrop, Crop
from app.schemas.schemas import UserResponse, UserProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["User Profile & Settings"])


@router.get("", response_model=UserResponse, summary="Get current authenticated user profile and settings")
def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile and settings of the authenticated user. Never returns another user's data."""
    return current_user


@router.put("", response_model=UserResponse, summary="Update user profile, farming details, preferences, and display settings")
def update_profile(
    payload: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile data strictly for the authenticated user.
    Enforces uniqueness if updating email.
    """
    if payload.email is not None:
        clean_email = payload.email.lower().strip()
        if clean_email != (current_user.email or "").lower():
            existing = db.query(User).filter(User.email == clean_email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use by another account."
                )
            current_user.email = clean_email

    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.bio is not None:
        current_user.bio = payload.bio.strip()
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.farm_size_acres is not None:
        current_user.farm_size_acres = payload.farm_size_acres
    if payload.farming_type is not None:
        current_user.farming_type = payload.farming_type
    if payload.irrigation_source is not None:
        current_user.irrigation_source = payload.irrigation_source
    if payload.profile_photo_url is not None:
        current_user.profile_photo_url = payload.profile_photo_url
    if payload.buyer_business_name is not None:
        current_user.buyer_business_name = payload.buyer_business_name
    if payload.buyer_type is not None:
        current_user.buyer_type = payload.buyer_type
    if payload.buyer_license_no is not None:
        current_user.buyer_license_no = payload.buyer_license_no
    if payload.text_size is not None:
        current_user.text_size = payload.text_size
    if payload.data_saver is not None:
        current_user.data_saver = payload.data_saver
    if payload.phone_visible is not None:
        current_user.phone_visible = payload.phone_visible
    if payload.location_id is not None:
        loc = db.query(Location).filter(Location.id == payload.location_id).first()
        if loc:
            current_user.location_id = loc.id

    if payload.crop_ids is not None:
        # Re-sync farmer crops
        db.query(UserCrop).filter(UserCrop.user_id == current_user.id).delete()
        for cid in payload.crop_ids:
            crop = db.query(Crop).filter(Crop.id == cid).first()
            if crop:
                uc = UserCrop(
                    user_id=current_user.id,
                    crop_id=cid,
                    acreage=current_user.farm_size_acres or 2.0,
                    stage="growing",
                    sowing_date=datetime.datetime.utcnow() - datetime.timedelta(days=45)
                )
                db.add(uc)

    db.commit()
    db.refresh(current_user)
    return current_user
