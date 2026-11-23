from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import SupportTicket, User
from app.schemas.schemas import SupportTicketCreate, SupportTicketResponse

router = APIRouter(prefix="/support", tags=["Help & Support"])


@router.post("/tickets", response_model=SupportTicketResponse, summary="Submit a new farmer / buyer support request")
def create_support_ticket(
    payload: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a support ticket specifically linked to the authenticated user."""
    ticket = SupportTicket(
        user_id=current_user.id,
        category=payload.category,
        subject=payload.subject.strip(),
        description=payload.description.strip(),
        status="open"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    resp = SupportTicketResponse.model_validate(ticket)
    resp.user_name = current_user.full_name
    resp.user_phone = current_user.phone_number
    return resp


@router.get("/tickets", response_model=List[SupportTicketResponse], summary="List support tickets submitted by authenticated user")
def get_user_support_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve only support tickets submitted by the authenticated user."""
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()
    results = []
    for t in tickets:
        r = SupportTicketResponse.model_validate(t)
        r.user_name = current_user.full_name
        r.user_phone = current_user.phone_number
        results.append(r)
    return results
