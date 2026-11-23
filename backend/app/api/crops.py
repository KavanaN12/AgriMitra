from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Crop, UserCrop, User
from app.schemas.schemas import CropResponse, UserCropCreate, UserCropUpdate, UserCropResponse

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropResponse], summary="List all supported regional crops with search & filter")
def get_crops(
    category: Optional[str] = Query(None, description="Filter by crop category (commercial, cereal, horticulture, vegetable)"),
    search: Optional[str] = Query(None, description="Search by crop name in English or Kannada"),
    db: Session = Depends(get_db)
):
    # Handle direct positional call in unit tests
    if isinstance(category, Session):
        db = category
        category = None

    query = db.query(Crop)
    if category and isinstance(category, str):
        query = query.filter(Crop.category.ilike(f"%{category}%"))
    if search and isinstance(search, str):
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Crop.name_en.ilike(search_term),
                Crop.name_kn.ilike(search_term),
                Crop.code.ilike(search_term)
            )
        )
    return query.all()

@router.get("/my", response_model=List[UserCropResponse], summary="List authenticated user enrolled crops")
def get_my_crops(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve only the crops enrolled by the authenticated user."""
    return db.query(UserCrop).filter(UserCrop.user_id == current_user.id).all()

@router.post("/my", response_model=UserCropResponse, status_code=status.HTTP_201_CREATED, summary="Enroll a crop for authenticated user")
def add_my_crop(
    payload: UserCropCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll crop specifically for the authenticated farmer."""
    crop = db.query(Crop).filter(Crop.id == payload.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    uc = UserCrop(
        user_id=current_user.id,
        crop_id=payload.crop_id,
        acreage=payload.acreage,
        sowing_date=payload.sowing_date,
        stage=payload.stage,
        soil_type=payload.soil_type,
        irrigation_type=payload.irrigation_type
    )
    db.add(uc)
    db.commit()
    db.refresh(uc)
    return uc

@router.put("/my/{id}", response_model=UserCropResponse, summary="Update an enrolled user crop")
def update_my_crop(
    id: int,
    payload: UserCropUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update enrolled crop with strict ownership verification."""
    uc = db.query(UserCrop).filter(UserCrop.id == id).first()
    if not uc:
        raise HTTPException(status_code=404, detail="User crop enrollment not found")

    if uc.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify another user's crop enrollment."
        )

    if payload.acreage is not None:
        uc.acreage = payload.acreage
    if payload.sowing_date is not None:
        uc.sowing_date = payload.sowing_date
    if payload.stage is not None:
        uc.stage = payload.stage
    if payload.soil_type is not None:
        uc.soil_type = payload.soil_type
    if payload.irrigation_type is not None:
        uc.irrigation_type = payload.irrigation_type

    db.commit()
    db.refresh(uc)
    return uc

@router.delete("/my/{id}", status_code=status.HTTP_200_OK, summary="Delete an enrolled user crop")
def delete_my_crop(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete enrolled crop with strict ownership verification."""
    uc = db.query(UserCrop).filter(UserCrop.id == id).first()
    if not uc:
        raise HTTPException(status_code=404, detail="User crop enrollment not found")

    if uc.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete another user's crop enrollment."
        )

    db.delete(uc)
    db.commit()
    return {"status": "success", "message": "Crop enrollment deleted successfully"}

@router.get("/{id}", response_model=CropResponse, summary="Get individual crop detail with growth stages and requirements")
def get_crop_by_id(id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop
