import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, settings
from app.core.incident import send_otp_email

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    access_token: str
    token_type: str = "bearer"
    is_protected: bool = False

    class Config:
        from_attributes = True

def check_is_protected(email: str) -> bool:
    protected = {
        settings.PRIMARY_ADMIN_EMAIL.lower() if settings.PRIMARY_ADMIN_EMAIL else "admin@cloudguard.local",
        settings.ALERT_RECEIVER.lower() if settings.ALERT_RECEIVER else "admin@cloudguard.local"
    }
    return email.lower() in protected

@router.post("/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email already registered"
        )
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        access_token=token,
        token_type="bearer",
        is_protected=check_is_protected(new_user.email)
    )

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == credentials.email) | (User.username == credentials.email)
    ).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        access_token=token,
        token_type="bearer",
        is_protected=check_is_protected(user.email)
    )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email address"
        )
    
    otp_code = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp_code
    user.reset_otp_expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)
    db.commit()

    send_otp_email(user.email, otp_code)
    return {"message": "Verification OTP sent to registered email", "email": user.email}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.reset_otp or user.reset_otp != req.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code (OTP)"
        )
    
    if user.reset_otp_expiry and user.reset_otp_expiry.tzinfo is None:
        user.reset_otp_expiry = user.reset_otp_expiry.replace(tzinfo=datetime.timezone.utc)

    if user.reset_otp_expiry and datetime.datetime.now(datetime.timezone.utc) > user.reset_otp_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code (OTP) has expired. Please request a new one."
        )

    user.hashed_password = hash_password(req.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.commit()

    return {"message": "Password successfully updated! You can now log in."}

class DeleteAccountRequest(BaseModel):
    email: str

@router.delete("/account")
def delete_account(req: DeleteAccountRequest, db: Session = Depends(get_db)):
    protected_emails = {
        settings.PRIMARY_ADMIN_EMAIL.lower() if settings.PRIMARY_ADMIN_EMAIL else "admin@cloudguard.local",
        settings.ALERT_RECEIVER.lower() if settings.ALERT_RECEIVER else "admin@cloudguard.local"
    }
    if req.email.lower() in protected_emails:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Primary administrator account ({req.email}) is protected and cannot be deleted."
        )
    
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "Account successfully deleted."}
