from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Notification, User, UserNotificationPreference
from app.schemas.schemas import (
    NotificationResponse,
    UserNotificationPreferenceResponse,
    UserNotificationPreferenceUpdate
)

router = APIRouter(prefix="/notifications", tags=["Notification Center"])


@router.get("", response_model=List[NotificationResponse], summary="List authenticated user notifications")
def get_notifications(
    type: Optional[str] = Query(None, description="Notification category: 'advisory', 'market', 'community', 'system', 'all'"),
    unread_only: bool = Query(False, description="Filter unread notifications only"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve notifications strictly owned by the authenticated user."""
    # Parameter normalization for direct unit test calls
    if isinstance(type, Session):
        db = type
        type = None
    if not isinstance(type, str):
        type = None
    if not isinstance(unread_only, bool):
        unread_only = False

    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if type and type != "all":
        query = query.filter(Notification.type == type)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    return query.order_by(Notification.created_at.desc()).all()


@router.patch("/{id}/read", response_model=NotificationResponse, summary="Mark individual notification as read")
def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read, strictly enforcing user ownership."""
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access another user's notifications."
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/read-all", summary="Mark all notifications for authenticated user as read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all unread notifications belonging to the current user as read."""
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update(
        {"is_read": True},
        synchronize_session=False
    )
    db.commit()
    return {"status": "success", "message": "All user notifications marked as read."}


@router.get("/preferences", response_model=UserNotificationPreferenceResponse, summary="Get user notification preferences")
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve notification preferences for the authenticated user."""
    pref = db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserNotificationPreference(
            user_id=current_user.id,
            advisory_alerts=True,
            community_updates=True,
            market_enquiries=True,
            system_announcements=True
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.put("/preferences", response_model=UserNotificationPreferenceResponse, summary="Update user notification preferences")
def update_notification_preferences(
    payload: UserNotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update notification preferences for the authenticated user."""
    pref = db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserNotificationPreference(user_id=current_user.id)
        db.add(pref)

    if payload.advisory_alerts is not None:
        pref.advisory_alerts = payload.advisory_alerts
    if payload.community_updates is not None:
        pref.community_updates = payload.community_updates
    if payload.market_enquiries is not None:
        pref.market_enquiries = payload.market_enquiries
    if payload.system_announcements is not None:
        pref.system_announcements = payload.system_announcements

    db.commit()
    db.refresh(pref)
    return pref
