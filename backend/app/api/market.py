from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_user_optional
from app.models.models import (
    MarketListing, MarketEnquiry, EnquiryMessage, SavedListing,
    GroupListingContribution, User, Crop, Location, CommunityGroup, GroupMember,
    Notification
)
from app.schemas.schemas import (
    MarketListingCreate, MarketListingUpdate, MarketListingResponse,
    MarketEnquiryCreate, MarketEnquiryStatusUpdate, MarketEnquiryResponse,
    EnquiryMessageCreate, EnquiryMessageResponse,
    GroupListingContributionCreate, GroupListingContributionResponse
)

router = APIRouter(prefix="/market", tags=["Farmer-to-Buyer Marketplace"])


# ----------------------------------------------------------------------
# 1. PRODUCE LISTINGS
# ----------------------------------------------------------------------

@router.get("/listings", response_model=List[MarketListingResponse], summary="List and browse produce listings with search & filters")
def get_market_listings(
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    variety: Optional[str] = Query(None, description="Filter by crop variety"),
    taluk: Optional[str] = Query(None, description="Filter by Mandya taluk"),
    district: Optional[str] = Query(None, description="Filter by district"),
    status: Optional[str] = Query(None, description="Listing status: 'active', 'paused', 'reserved', 'sold', 'all'"),
    is_collective: Optional[bool] = Query(None, description="Filter for collective farmer-group listings"),
    filter_type: Optional[str] = Query(None, description="Filter by: 'all', 'my', 'saved'"),
    search: Optional[str] = Query(None, description="Search crop name, variety, village or description"),
    sort_by: Optional[str] = Query(None, description="Sorting: 'newest', 'price_asc', 'price_desc', 'harvest_soon'"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Parameter normalization for direct unit test calls
    if isinstance(crop_id, Session):
        db = crop_id
        crop_id = None
    if not isinstance(crop_id, int): crop_id = None
    if not isinstance(variety, str): variety = None
    if not isinstance(taluk, str): taluk = None
    if not isinstance(district, str): district = None
    if not isinstance(status, str): status = None
    if not isinstance(is_collective, bool): is_collective = None
    if not isinstance(filter_type, str): filter_type = None
    if not isinstance(search, str): search = None
    if not isinstance(sort_by, str): sort_by = None
    if not isinstance(page, int): page = 1
    if not isinstance(limit, int): limit = 20

    if not isinstance(current_user, User):
        current_user = None

    user_id = current_user.id if current_user else None

    query = db.query(MarketListing)

    # Status filter (default to 'active' or 'available' unless specifically asked)
    if status and status != "all":
        if status in ("available", "active"):
            query = query.filter(or_(MarketListing.status == "active", MarketListing.status == "available"))
        else:
            query = query.filter(MarketListing.status == status)
    elif not status and filter_type != "my":
        query = query.filter(or_(MarketListing.status == "active", MarketListing.status == "available"))

    if crop_id:
        query = query.filter(MarketListing.crop_id == crop_id)

    if variety:
        query = query.filter(MarketListing.variety.ilike(f"%{variety}%"))

    if taluk:
        query = query.filter(MarketListing.taluk.ilike(f"%{taluk}%"))

    if district:
        query = query.filter(MarketListing.district.ilike(f"%{district}%"))

    if is_collective is not None:
        query = query.filter(MarketListing.is_collective == is_collective)

    # Search filter
    if search:
        s = f"%{search}%"
        query = query.join(Crop, MarketListing.crop_id == Crop.id, isouter=True)
        query = query.filter(
            or_(
                MarketListing.variety.ilike(s),
                MarketListing.village.ilike(s),
                MarketListing.taluk.ilike(s),
                MarketListing.description.ilike(s),
                Crop.name_en.ilike(s),
                Crop.name_kn.ilike(s)
            )
        )

    # My Listings filter
    if filter_type == "my":
        if not user_id:
            return []
        query = query.filter(MarketListing.farmer_id == user_id)

    # Saved Listings filter
    if filter_type == "saved":
        if not user_id:
            return []
        saved_listing_ids = db.query(SavedListing.listing_id).filter(SavedListing.user_id == user_id)
        query = query.filter(MarketListing.id.in_(saved_listing_ids))

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(MarketListing.price_per_unit.asc())
    elif sort_by == "price_desc":
        query = query.order_by(MarketListing.price_per_unit.desc())
    elif sort_by == "harvest_soon":
        query = query.order_by(MarketListing.harvest_date.asc().nullslast())
    else:
        query = query.order_by(MarketListing.created_at.desc())

    offset = (page - 1) * limit
    listings = query.offset(offset).limit(limit).all()

    # Pre-fetch saved listings IDs for current user
    saved_ids = set()
    if user_id:
        saved_ids = set(r[0] for r in db.query(SavedListing.listing_id).filter(SavedListing.user_id == user_id).all())

    result = []
    for l in listings:
        resp = MarketListingResponse.model_validate(l)
        if l.farmer:
            resp.farmer_name = l.farmer.full_name
            resp.farmer_phone = l.farmer.phone_number
            if l.farmer.location:
                resp.farmer_village = l.farmer.location.village
        if l.crop:
            resp.crop_name_en = l.crop.name_en
            resp.crop_name_kn = l.crop.name_kn
        if l.group:
            resp.group_name = l.group.name_kn or l.group.name_en

        resp.is_saved = l.id in saved_ids
        resp.enquiries_count = len(l.enquiries)
        resp.contributions_count = len(l.contributions)
        result.append(resp)

    return result


@router.post("/listings", response_model=MarketListingResponse, summary="Create a new produce listing (Individual farmer or Collective Group)")
def create_market_listing(
    payload: MarketListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new produce listing with authenticated farmer identity."""
    # If this is a collective farmer group listing, verify group & user permissions
    group = None
    if payload.group_id or payload.is_collective:
        if not payload.group_id:
            raise HTTPException(status_code=400, detail="Group ID is required for collective produce listings.")
        group = db.query(CommunityGroup).filter(CommunityGroup.id == payload.group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Specified village group not found.")
        
        # Verify user is approved member or admin of this group
        member = db.query(GroupMember).filter(
            GroupMember.group_id == payload.group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "approved"
        ).first()
        if not member and group.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="You must be an approved member or admin of this village group to create a collective listing.")

    # Location fallbacks from user profile
    village = payload.village or (current_user.location.village if current_user.location else "Shivapura")
    taluk = payload.taluk or (current_user.location.taluk if current_user.location else "Maddur")
    district = payload.district or "Mandya"

    default_crop_images = {
        1: "/images/crops/sugarcane.jpg",
        2: "/images/crops/paddy.jpg",
        3: "/images/crops/ragi.jpg",
        4: "/images/crops/banana.jpg",
        5: "/images/crops/coconut.jpg",
        6: "/images/crops/tomato.jpg",
    }
    img_url = payload.image_url or default_crop_images.get(payload.crop_id, "/images/crops/sugarcane.jpg")

    listing = MarketListing(
        farmer_id=current_user.id,
        group_id=payload.group_id if payload.is_collective else None,
        crop_id=payload.crop_id,
        variety=payload.variety,
        quantity=payload.quantity,
        unit=payload.unit,
        price_per_unit=payload.price_per_unit,
        harvest_date=payload.harvest_date,
        available_from=payload.available_from or datetime.datetime.utcnow(),
        available_until=payload.available_until,
        village=village,
        taluk=taluk,
        district=district,
        pickup_address=payload.pickup_address,
        image_url=img_url,
        is_collective=payload.is_collective,
        status="active",
        description=payload.description
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # If collective listing, automatically record creator's initial contribution
    if payload.is_collective:
        contrib = GroupListingContribution(
            listing_id=listing.id,
            farmer_id=current_user.id,
            farmer_name=current_user.full_name,
            farmer_phone=current_user.phone_number,
            farmer_village=village,
            quantity=payload.quantity,
            unit=payload.unit,
            notes="Initial collective listing harvest share"
        )
        db.add(contrib)
        db.commit()

    resp = MarketListingResponse.model_validate(listing)
    resp.farmer_name = current_user.full_name
    resp.farmer_phone = current_user.phone_number
    resp.farmer_village = village
    if group:
        resp.group_name = group.name_kn or group.name_en
    if listing.crop:
        resp.crop_name_en = listing.crop.name_en
        resp.crop_name_kn = listing.crop.name_kn
    resp.is_saved = False
    resp.enquiries_count = 0
    resp.contributions_count = 1 if payload.is_collective else 0
    return resp


@router.get("/listings/{listing_id}", response_model=MarketListingResponse, summary="Get produce listing details by ID")
def get_market_listing_detail(
    listing_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    is_saved = False
    if current_user:
        is_saved = db.query(SavedListing).filter(
            SavedListing.listing_id == listing_id,
            SavedListing.user_id == current_user.id
        ).first() is not None

    resp = MarketListingResponse.model_validate(listing)
    if listing.farmer:
        resp.farmer_name = listing.farmer.full_name
        resp.farmer_phone = listing.farmer.phone_number
        if listing.farmer.location:
            resp.farmer_village = listing.farmer.location.village
    if listing.crop:
        resp.crop_name_en = listing.crop.name_en
        resp.crop_name_kn = listing.crop.name_kn
    if listing.group:
        resp.group_name = listing.group.name_kn or listing.group.name_en

    resp.is_saved = is_saved
    resp.enquiries_count = len(listing.enquiries)
    resp.contributions_count = len(listing.contributions)
    if listing.is_collective and listing.contributions:
        resp.contributions = [GroupListingContributionResponse.model_validate(c) for c in listing.contributions]
    return resp


@router.put("/listings/{listing_id}", response_model=MarketListingResponse, summary="Update produce listing details")
def update_market_listing(
    listing_id: int,
    payload: MarketListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    # Authorization check: only owner, group admin, or platform admin
    if listing.farmer_id != current_user.id and not current_user.is_admin:
        if listing.group_id:
            member = db.query(GroupMember).filter(
                GroupMember.group_id == listing.group_id,
                GroupMember.user_id == current_user.id,
                GroupMember.role == "admin"
            ).first()
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to edit another farmer's listing."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit another farmer's listing."
            )

    if payload.variety is not None: listing.variety = payload.variety
    if payload.quantity is not None: listing.quantity = payload.quantity
    if payload.unit is not None: listing.unit = payload.unit
    if payload.price_per_unit is not None: listing.price_per_unit = payload.price_per_unit
    if payload.harvest_date is not None: listing.harvest_date = payload.harvest_date
    if payload.available_from is not None: listing.available_from = payload.available_from
    if payload.available_until is not None: listing.available_until = payload.available_until
    if payload.pickup_address is not None: listing.pickup_address = payload.pickup_address
    if payload.image_url is not None: listing.image_url = payload.image_url
    if payload.status is not None: listing.status = payload.status
    if payload.description is not None: listing.description = payload.description

    db.commit()
    db.refresh(listing)

    resp = MarketListingResponse.model_validate(listing)
    resp.farmer_name = listing.farmer.full_name if listing.farmer else current_user.full_name
    if listing.crop:
        resp.crop_name_en = listing.crop.name_en
        resp.crop_name_kn = listing.crop.name_kn
    return resp


@router.patch("/listings/{listing_id}/status", summary="Pause, reactivate or mark listing as sold/reserved")
def update_listing_status(
    listing_id: int,
    status: str = Query(..., description="Status: 'active', 'paused', 'reserved', 'sold'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    if listing.farmer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to change status of another farmer's listing."
        )

    valid_statuses = {"active", "paused", "reserved", "sold"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    listing.status = status
    db.commit()
    return {"status": "success", "listing_status": status, "message": f"Listing status updated to {status}"}


@router.delete("/listings/{listing_id}", summary="Delete produce listing")
def delete_market_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    if listing.farmer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete another farmer's listing."
        )

    db.delete(listing)
    db.commit()
    return {"status": "success", "message": "Listing deleted successfully"}


@router.post("/listings/{listing_id}/save", summary="Toggle save / bookmark produce listing")
def toggle_save_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    existing = db.query(SavedListing).filter(
        SavedListing.listing_id == listing_id,
        SavedListing.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "success", "saved": False, "is_saved": False, "message": "Listing removed from saved bookmarks"}
    else:
        new_save = SavedListing(listing_id=listing_id, user_id=current_user.id)
        db.add(new_save)
        db.commit()
        return {"status": "success", "saved": True, "is_saved": True, "message": "Listing bookmarked successfully"}


@router.post("/listings/{listing_id}/contribute", response_model=GroupListingContributionResponse, summary="Contribute harvest quantity to a collective group listing")
def contribute_to_collective_listing(
    listing_id: int,
    payload: GroupListingContributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(current_user, User):
        current_user = None
    listing = db.query(MarketListing).filter(MarketListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    if not listing.is_collective or not listing.group_id:
        raise HTTPException(status_code=400, detail="This listing is an individual produce listing, not a collective group listing.")

    # Verify user is member of the collective's group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == listing.group_id,
        GroupMember.user_id == current_user.id,
        GroupMember.status == "approved"
    ).first()
    if not member and listing.group and listing.group.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You must be an approved member of this farmer group to contribute.")

    # Create contribution
    contrib = GroupListingContribution(
        listing_id=listing_id,
        farmer_id=current_user.id,
        farmer_name=current_user.full_name,
        farmer_phone=current_user.phone_number,
        farmer_village=current_user.location.village if current_user.location else "Mandya",
        quantity=payload.quantity,
        unit=payload.unit,
        notes=payload.notes
    )
    db.add(contrib)

    # Increment total collective listing quantity
    listing.quantity += payload.quantity
    db.commit()
    db.refresh(contrib)

    resp = GroupListingContributionResponse.model_validate(contrib)
    return resp


# ----------------------------------------------------------------------
# 2. BUYER ENQUIRIES & COMMUNICATION THREADS
# ----------------------------------------------------------------------

@router.get("/enquiries", response_model=List[MarketEnquiryResponse], summary="List buyer enquiries for authenticated user")
def get_market_enquiries(
    role: Optional[str] = Query(None, description="Role filter: 'farmer' (received inbox), 'buyer' (sent enquiries)"),
    status: Optional[str] = Query(None, description="Enquiry status filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not isinstance(role, str): role = None
    if not isinstance(status, str): status = None

    query = db.query(MarketEnquiry).join(MarketListing, MarketEnquiry.listing_id == MarketListing.id)

    if role == "farmer":
        query = query.filter(MarketListing.farmer_id == current_user.id)
    elif role == "buyer":
        query = query.filter(MarketEnquiry.buyer_id == current_user.id)
    else:
        # Default: user is either buyer or seller in the enquiry
        query = query.filter(or_(MarketEnquiry.buyer_id == current_user.id, MarketListing.farmer_id == current_user.id))

    if status and status != "all":
        query = query.filter(MarketEnquiry.status == status)

    enquiries = query.order_by(MarketEnquiry.created_at.desc()).all()
    result = []
    for e in enquiries:
        resp = MarketEnquiryResponse.model_validate(e)
        if e.buyer:
            resp.buyer_name = e.buyer.full_name
            resp.buyer_phone = e.buyer.phone_number
            if e.buyer.location:
                resp.buyer_village = e.buyer.location.village
        if e.listing:
            resp.listing_title = f"{e.listing.crop.name_en if e.listing.crop else 'Produce'} ({e.listing.variety or 'Standard'})"
            resp.listing_crop_en = e.listing.crop.name_en if e.listing.crop else None
            resp.listing_crop_kn = e.listing.crop.name_kn if e.listing.crop else None
            resp.listing_price = e.listing.price_per_unit
            resp.listing_unit = e.listing.unit
            resp.farmer_id = e.listing.farmer_id
            resp.farmer_name = e.listing.farmer.full_name if e.listing.farmer else None
        
        if e.messages:
            resp.messages = [
                EnquiryMessageResponse(
                    id=m.id,
                    enquiry_id=m.enquiry_id,
                    sender_id=m.sender_id,
                    sender_name=m.sender.full_name if m.sender else None,
                    sender_role=m.sender.role if m.sender else None,
                    message=m.message,
                    proposed_price=m.proposed_price,
                    created_at=m.created_at
                )
                for m in e.messages
            ]
        result.append(resp)
    return result


@router.post("/enquiries", response_model=MarketEnquiryResponse, summary="Send purchase enquiry to farmer")
def create_market_enquiry(
    payload: MarketEnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(MarketListing).filter(MarketListing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Produce listing not found.")

    if listing.farmer_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send enquiry on your own produce listing.")

    enquiry = MarketEnquiry(
        listing_id=payload.listing_id,
        buyer_id=current_user.id,
        quantity_requested=payload.quantity_requested,
        offered_price=payload.offered_price or listing.price_per_unit,
        message=payload.message,
        status="pending"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    # Initial message in thread
    if payload.message:
        init_msg = EnquiryMessage(
            enquiry_id=enquiry.id,
            sender_id=current_user.id,
            message=payload.message,
            proposed_price=payload.offered_price
        )
        db.add(init_msg)

    # Notify farmer
    crop_name = listing.crop.name_en if listing.crop else "produce"
    crop_name_kn = listing.crop.name_kn if listing.crop else "ಬೆಳೆ"
    notif = Notification(
        user_id=listing.farmer_id,
        title_en=f"New Buyer Enquiry for {crop_name}",
        title_kn=f"{crop_name_kn} ಬೆಳೆಗೆ ಹೊಸ ಖರೀದಿ ವಿಚಾರಣೆ",
        message_en=f"{current_user.full_name} sent a purchase enquiry for {payload.quantity_requested} {listing.unit} at ₹{payload.offered_price or listing.price_per_unit}/{listing.unit}.",
        message_kn=f"{current_user.full_name} ಅವರು {payload.quantity_requested} {listing.unit} ಪ್ರಮಾಣಕ್ಕೆ ₹{payload.offered_price or listing.price_per_unit} ದರದಲ್ಲಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿದ್ದಾರೆ.",
        type="market",
        related_entity_type="enquiry",
        related_entity_id=enquiry.id,
        is_read=False
    )
    db.add(notif)
    db.commit()

    resp = MarketEnquiryResponse.model_validate(enquiry)
    resp.buyer_name = current_user.full_name
    resp.buyer_phone = current_user.phone_number
    resp.listing_title = f"{crop_name} ({listing.variety or 'Standard'})"
    resp.listing_crop_en = crop_name
    resp.listing_crop_kn = crop_name_kn
    resp.listing_price = listing.price_per_unit
    resp.listing_unit = listing.unit
    resp.farmer_id = listing.farmer_id
    resp.farmer_name = listing.farmer.full_name if listing.farmer else None
    return resp


@router.get("/enquiries/{enquiry_id}", response_model=MarketEnquiryResponse, summary="Get enquiry detail with message thread")
def get_enquiry_detail(
    enquiry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve enquiry detail strictly verifying that the caller is
    either the buyer who sent it or the farmer who owns the listing.
    """
    enquiry = db.query(MarketEnquiry).filter(MarketEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")

    # Strict authorization check
    is_buyer = enquiry.buyer_id == current_user.id
    is_farmer = enquiry.listing and enquiry.listing.farmer_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    if not (is_buyer or is_farmer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view another user's private enquiry."
        )

    resp = MarketEnquiryResponse.model_validate(enquiry)
    if enquiry.buyer:
        resp.buyer_name = enquiry.buyer.full_name
        resp.buyer_phone = enquiry.buyer.phone_number
        if enquiry.buyer.location:
            resp.buyer_village = enquiry.buyer.location.village
    if enquiry.listing:
        resp.listing_title = f"{enquiry.listing.crop.name_en if enquiry.listing.crop else 'Produce'} ({enquiry.listing.variety or 'Standard'})"
        resp.listing_crop_en = enquiry.listing.crop.name_en if enquiry.listing.crop else None
        resp.listing_crop_kn = enquiry.listing.crop.name_kn if enquiry.listing.crop else None
        resp.listing_price = enquiry.listing.price_per_unit
        resp.listing_unit = enquiry.listing.unit
        resp.farmer_id = enquiry.listing.farmer_id
        resp.farmer_name = enquiry.listing.farmer.full_name if enquiry.listing.farmer else None

    if enquiry.messages:
        resp.messages = [
            EnquiryMessageResponse(
                id=m.id,
                enquiry_id=m.enquiry_id,
                sender_id=m.sender_id,
                sender_name=m.sender.full_name if m.sender else None,
                sender_role=m.sender.role if m.sender else None,
                message=m.message,
                proposed_price=m.proposed_price,
                created_at=m.created_at
            )
            for m in enquiry.messages
        ]
    return resp


@router.patch("/enquiries/{enquiry_id}/status", response_model=MarketEnquiryResponse, summary="Accept, decline, cancel or close an enquiry")
def update_enquiry_status(
    enquiry_id: int,
    payload: MarketEnquiryStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiry = db.query(MarketEnquiry).filter(MarketEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")

    is_buyer = enquiry.buyer_id == current_user.id
    is_farmer = enquiry.listing and enquiry.listing.farmer_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    if not (is_buyer or is_farmer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this enquiry."
        )

    new_status = payload.status.lower()
    valid_statuses = {"accepted", "declined", "cancelled", "closed"}
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    # Enforce role-based actions
    if new_status in ("accepted", "declined") and not is_farmer and not is_admin:
        raise HTTPException(status_code=403, detail="Only the farmer selling the produce can accept or decline enquiries.")
    if new_status == "cancelled" and not is_buyer and not is_admin:
        raise HTTPException(status_code=403, detail="Only the buyer can cancel this enquiry.")

    enquiry.status = new_status
    db.commit()
    db.refresh(enquiry)

    # Add notification for the other party
    recipient_id = enquiry.buyer_id if is_farmer else (enquiry.listing.farmer_id if enquiry.listing else None)
    if recipient_id:
        notif = Notification(
            user_id=recipient_id,
            title_en=f"Produce Enquiry {new_status.title()}",
            title_kn=f"ಖರೀದಿ ವಿಚಾರಣೆ {new_status}",
            message_en=f"Your enquiry for {enquiry.listing.crop.name_en if enquiry.listing and enquiry.listing.crop else 'produce'} was marked as {new_status}.",
            message_kn=f"ನಿಮ್ಮ ಖರೀದಿ ವಿಚಾರಣೆಯು {new_status} ಸ್ಥಿತಿಗೆ ಬದಲಾಗಿದೆ.",
            type="market",
            related_entity_type="enquiry",
            related_entity_id=enquiry.id,
            is_read=False
        )
        db.add(notif)
        db.commit()

    resp = MarketEnquiryResponse.model_validate(enquiry)
    return resp


@router.post("/enquiries/{enquiry_id}/messages", response_model=EnquiryMessageResponse, summary="Send message or counter-offer in enquiry thread")
def send_enquiry_message(
    enquiry_id: int,
    payload: EnquiryMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiry = db.query(MarketEnquiry).filter(MarketEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")

    is_buyer = enquiry.buyer_id == current_user.id
    is_farmer = enquiry.listing and enquiry.listing.farmer_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    if not (is_buyer or is_farmer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to participate in this enquiry discussion."
        )

    msg = EnquiryMessage(
        enquiry_id=enquiry_id,
        sender_id=current_user.id,
        message=payload.message,
        proposed_price=payload.proposed_price
    )
    db.add(msg)
    if payload.proposed_price:
        enquiry.offered_price = payload.proposed_price
    db.commit()
    db.refresh(msg)

    resp = EnquiryMessageResponse(
        id=msg.id,
        enquiry_id=msg.enquiry_id,
        sender_id=msg.sender_id,
        sender_name=current_user.full_name,
        sender_role=current_user.role,
        message=msg.message,
        proposed_price=msg.proposed_price,
        created_at=msg.created_at
    )
    return resp
