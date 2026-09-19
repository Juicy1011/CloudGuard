from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.database import get_db
from app.models.setting import NotificationEmail
from app.core.security import settings
from app.api.servers import get_current_user_id

router = APIRouter()

class EmailCreate(BaseModel):
    email: str

class EmailResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

@router.get("/emails", response_model=List[EmailResponse])
def get_notification_emails(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    emails = db.query(NotificationEmail).filter(NotificationEmail.owner_id == current_user_id).all()
    return emails

@router.post("/emails", response_model=EmailResponse)
def add_notification_email(payload: EmailCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    cleaned_email = payload.email.strip().lower()
    if not cleaned_email or "@" not in cleaned_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address format"
        )
    
    existing = db.query(NotificationEmail).filter(
        NotificationEmail.email == cleaned_email,
        NotificationEmail.owner_id == current_user_id
    ).first()
    if existing:
        return existing
        
    entry = NotificationEmail(email=cleaned_email, owner_id=current_user_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/emails/{email_identifier:path}")
def delete_notification_email(email_identifier: str, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    identifier = email_identifier.strip().lower()
    
    entry = None
    if identifier.isdigit():
        entry = db.query(NotificationEmail).filter(
            NotificationEmail.id == int(identifier),
            NotificationEmail.owner_id == current_user_id
        ).first()
    
    if not entry:
        entry = db.query(NotificationEmail).filter(
            NotificationEmail.email == identifier,
            NotificationEmail.owner_id == current_user_id
        ).first()
        
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email address not found in notification list"
        )

    removed_email = entry.email
    db.delete(entry)
    db.commit()
    return {"message": f"Successfully removed {removed_email} from alert recipients"}
