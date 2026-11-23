from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.auth import get_current_admin
from app.models.models import (
    User, Crop, Location, AdvisoryItem,
    CommunityGroup, GroupMember, CommunityPost, PostComment,
    ContentReport, MarketListing, SupportTicket, ModerationAuditLog
)
from app.schemas.schemas import (
    AdminPlatformStats, UserResponse, AdminUserUpdate, AdminUserBadgeUpdate,
    AdminReportResolveRequest, AdminGroupStatusUpdate, AdminCropCreate, AdminCropUpdate,
    CropResponse, SupportTicketResponse, SupportTicketStatusUpdate,
    ModerationAuditLogResponse
)

router = APIRouter(prefix="/admin", tags=["Platform Administration"])


# ----------------------------------------------------------------------
# 1. PLATFORM OVERVIEW & USAGE METRICS
# ----------------------------------------------------------------------

@router.get("/stats", response_model=AdminPlatformStats, summary="Platform overview and usage statistics")
def get_platform_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if not isinstance(admin, User) or (not admin.is_admin and admin.role != "admin"):
        raise HTTPException(status_code=403, detail="Forbidden. Administrator privileges required.")
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role.in_(["farmer", "both"])).count()
    total_buyers = db.query(User).filter(User.role.in_(["buyer", "both"])).count()
    total_listings = db.query(MarketListing).count()
    total_groups = db.query(CommunityGroup).count()
    pending_reports = db.query(ContentReport).filter(ContentReport.status == "pending").count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status == "open").count()
    total_advisories = db.query(AdvisoryItem).count()

    return AdminPlatformStats(
        total_users=total_users,
        total_farmers=total_farmers,
        total_buyers=total_buyers,
        total_listings=total_listings,
        total_groups=total_groups,
        pending_reports_count=pending_reports,
        open_tickets_count=open_tickets,
        total_advisories_count=total_advisories
    )


# ----------------------------------------------------------------------
# 2. USER MANAGEMENT & BADGE ASSIGNMENT
# ----------------------------------------------------------------------

@router.get("/users", response_model=List[UserResponse], summary="List and search users across Mandya platform")
def get_admin_users(
    search: Optional[str] = Query(None, description="Search user name or phone"),
    role: Optional[str] = Query(None, description="Filter by role: farmer, buyer, both, admin"),
    is_active: Optional[bool] = Query(None, description="Filter active/suspended status"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(User.full_name.ilike(s), User.phone_number.ilike(s)))
    if role and role != "all":
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.order_by(User.id.asc()).all()


@router.patch("/users/{user_id}/status", response_model=UserResponse, summary="Suspend or reinstate a user account")
def update_user_status(
    user_id: int,
    payload: AdminUserUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.is_active is not None:
        target_user.is_active = payload.is_active
        action_name = "reinstate_user" if payload.is_active else "suspend_user"
        audit = ModerationAuditLog(
            admin_id=admin.id,
            action=action_name,
            target_type="user",
            target_id=target_user.id,
            details=f"User status updated to active={payload.is_active}"
        )
        db.add(audit)

    if payload.role:
        target_user.role = payload.role

    db.commit()
    db.refresh(target_user)
    return target_user


@router.patch("/users/{user_id}/badges", response_model=UserResponse, summary="Assign or remove verified/expert badges")
def update_user_badges(
    user_id: int,
    payload: AdminUserBadgeUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    changes = []
    if payload.is_verified is not None:
        target_user.is_verified = payload.is_verified
        changes.append(f"verified={payload.is_verified}")
    if payload.is_expert is not None:
        target_user.is_expert = payload.is_expert
        changes.append(f"expert={payload.is_expert}")

    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="assign_badge",
        target_type="user",
        target_id=target_user.id,
        details=f"Updated badges: {', '.join(changes)}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return target_user


# ----------------------------------------------------------------------
# 3. COMMUNITY CONTENT REPORTS MODERATION QUEUE
# ----------------------------------------------------------------------

@router.get("/reports", summary="List content moderation reports")
def get_content_reports(
    status: Optional[str] = Query("all", description="Report status: 'pending', 'reviewed', 'dismissed', 'all'"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ContentReport)
    if status and status != "all":
        query = query.filter(ContentReport.status == status)

    reports = query.order_by(ContentReport.created_at.desc()).all()
    results = []
    for r in reports:
        item = {
            "id": r.id,
            "user_id": r.user_id,
            "reporter_name": r.user.full_name if r.user else "Anonymous Farmer",
            "post_id": r.post_id,
            "post_title": r.post.title if r.post else None,
            "post_content": r.post.content if r.post else None,
            "author_name": r.post.author.full_name if (r.post and r.post.author) else None,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at
        }
        results.append(item)
    return results


@router.patch("/reports/{report_id}/resolve", summary="Resolve a content report and optionally take down reported content")
def resolve_content_report(
    report_id: int,
    payload: AdminReportResolveRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(ContentReport).filter(ContentReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Content report not found.")

    if payload.action == "take_down":
        if report.post:
            db.delete(report.post)
        report.status = "reviewed"
        details_txt = f"Post removed by admin. Notes: {payload.notes or 'Violated community guidelines'}"
    elif payload.action == "dismiss":
        report.status = "dismissed"
        details_txt = f"Report dismissed as benign. Notes: {payload.notes or 'No violation found'}"
    else:
        report.status = "reviewed"
        details_txt = f"Report marked as reviewed. Notes: {payload.notes or 'Author warned'}"

    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="resolve_report",
        target_type="content_report",
        target_id=report.id,
        details=details_txt
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "report_status": report.status, "message": details_txt}


@router.patch("/reports/{report_id}/dismiss", summary="Dismiss a content report")
def dismiss_content_report(
    report_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(ContentReport).filter(ContentReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Content report not found.")

    report.status = "dismissed"
    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="dismiss_report",
        target_type="content_report",
        target_id=report.id,
        details="Report dismissed without penalty."
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "report_status": "dismissed", "message": "Report dismissed."}


# ----------------------------------------------------------------------
# 4. VILLAGE GROUPS MODERATION
# ----------------------------------------------------------------------

@router.get("/groups", summary="List all village groups with administrative moderation controls")
def get_admin_groups(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    groups = db.query(CommunityGroup).order_by(CommunityGroup.created_at.desc()).all()
    results = []
    for g in groups:
        results.append({
            "id": g.id,
            "name_en": g.name_en,
            "name_kn": g.name_kn,
            "taluk": g.taluk,
            "village": g.village,
            "creator_id": g.creator_id,
            "creator_name": g.creator.full_name if g.creator else None,
            "member_count": len(g.members),
            "announcements_count": len(g.announcements),
            "is_active": g.is_active,
            "created_at": g.created_at
        })
    return results


@router.patch("/groups/{group_id}/status", summary="Activate or deactivate a village group")
def update_group_status(
    group_id: int,
    payload: AdminGroupStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Village group not found.")

    group.is_active = payload.is_active
    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="moderate_group",
        target_type="community_group",
        target_id=group.id,
        details=f"Group status set to active={payload.is_active}. Reason: {payload.reason or 'Admin policy'}"
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "group_id": group.id, "is_active": group.is_active}


# ----------------------------------------------------------------------
# 5. CROP INFORMATION MANAGEMENT
# ----------------------------------------------------------------------

@router.get("/crops", response_model=List[CropResponse], summary="List all crops for administration")
def get_admin_crops(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Crop).order_by(Crop.id.asc()).all()


@router.post("/crops", response_model=CropResponse, summary="Add new crop to platform database")
def create_admin_crop(
    payload: AdminCropCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Crop).filter(Crop.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="A crop with this unique code already exists.")

    new_crop = Crop(
        code=payload.code.upper(),
        name_en=payload.name_en,
        name_kn=payload.name_kn,
        category=payload.category,
        seasonality=payload.seasonality,
        typical_duration_days=payload.typical_duration_days
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)

    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="update_crop",
        target_type="crop",
        target_id=new_crop.id,
        details=f"Added new crop {new_crop.name_en} ({new_crop.code})"
    )
    db.add(audit)
    db.commit()

    return new_crop


@router.put("/crops/{crop_id}", response_model=CropResponse, summary="Update crop seasonality and duration specifications")
def update_admin_crop(
    crop_id: int,
    payload: AdminCropUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")

    if payload.name_en: crop.name_en = payload.name_en
    if payload.name_kn: crop.name_kn = payload.name_kn
    if payload.category: crop.category = payload.category
    if payload.seasonality: crop.seasonality = payload.seasonality
    if payload.typical_duration_days is not None: crop.typical_duration_days = payload.typical_duration_days

    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="update_crop",
        target_type="crop",
        target_id=crop.id,
        details=f"Updated crop details for {crop.name_en}"
    )
    db.add(audit)
    db.commit()
    db.refresh(crop)
    return crop


# ----------------------------------------------------------------------
# 6. SUPPORT TICKETS MANAGEMENT
# ----------------------------------------------------------------------

@router.get("/support-tickets", response_model=List[SupportTicketResponse], summary="List all platform support tickets")
def get_admin_support_tickets(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    results = []
    for t in tickets:
        r = SupportTicketResponse.model_validate(t)
        r.user_name = t.user.full_name if t.user else "Farmer"
        r.user_phone = t.user.phone_number if t.user else ""
        results.append(r)
    return results


@router.patch("/support-tickets/{ticket_id}", response_model=SupportTicketResponse, summary="Resolve or update support ticket")
def update_admin_support_ticket(
    ticket_id: int,
    payload: SupportTicketStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    ticket.status = payload.status
    if payload.resolution_notes:
        ticket.resolution_notes = payload.resolution_notes

    audit = ModerationAuditLog(
        admin_id=admin.id,
        action="resolve_ticket",
        target_type="support_ticket",
        target_id=ticket.id,
        details=f"Ticket #{ticket.id} status set to {payload.status}. Notes: {payload.resolution_notes or ''}"
    )
    db.add(audit)
    db.commit()
    db.refresh(ticket)

    resp = SupportTicketResponse.model_validate(ticket)
    resp.user_name = ticket.user.full_name if ticket.user else "Farmer"
    resp.user_phone = ticket.user.phone_number if ticket.user else ""
    return resp


# ----------------------------------------------------------------------
# 7. ACTIVITY & MODERATION AUDIT LOGS
# ----------------------------------------------------------------------

@router.get("/audit-logs", response_model=List[ModerationAuditLogResponse], summary="List platform activity and moderation audit logs")
def get_audit_logs(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    logs = db.query(ModerationAuditLog).order_by(ModerationAuditLog.created_at.desc()).limit(100).all()
    results = []
    for l in logs:
        r = ModerationAuditLogResponse.model_validate(l)
        r.admin_name = l.admin.full_name if l.admin else "System Administrator"
        results.append(r)
    return results
