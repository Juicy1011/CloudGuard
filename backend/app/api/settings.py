from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
from app.database import get_db
from app.models.setting import NotificationEmail
from app.core.security import settings

router = APIRouter()

class EmailCreate(BaseModel):
    email: str

class EmailResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

@router.get("/emails", response_model=List[EmailResponse])
def get_notification_emails(db: Session = Depends(get_db)):
    emails = db.query(NotificationEmail).all()
    if not emails:
        default_email = settings.ALERT_RECEIVER or "trueyours1@gmail.com"
        existing = db.query(NotificationEmail).filter(NotificationEmail.email == default_email).first()
        if not existing:
            default_entry = NotificationEmail(email=default_email)
            db.add(default_entry)
            db.commit()
            db.refresh(default_entry)
            emails = [default_entry]
    return emails

@router.post("/emails", response_model=EmailResponse)
def add_notification_email(payload: EmailCreate, db: Session = Depends(get_db)):
    cleaned_email = payload.email.strip().lower()
    if not cleaned_email or "@" not in cleaned_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address format"
        )
    
    existing = db.query(NotificationEmail).filter(NotificationEmail.email == cleaned_email).first()
    if existing:
        return existing
        
    entry = NotificationEmail(email=cleaned_email)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/emails/{email_identifier:path}")
def delete_notification_email(email_identifier: str, db: Session = Depends(get_db)):
    identifier = email_identifier.strip().lower()
    
    entry = None
    if identifier.isdigit():
        entry = db.query(NotificationEmail).filter(NotificationEmail.id == int(identifier)).first()
    
    if not entry:
        entry = db.query(NotificationEmail).filter(NotificationEmail.email == identifier).first()
        
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email address not found in notification list"
        )
    
    if entry.email.lower() == "trueyours1@gmail.com" or (settings.ALERT_RECEIVER and entry.email.lower() == settings.ALERT_RECEIVER.lower()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primary system recipient email is locked and cannot be deleted"
        )

    removed_email = entry.email
    db.delete(entry)
    db.commit()
    return {"message": f"Successfully removed {removed_email} from alert recipients"}
