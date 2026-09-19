import os
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from passlib.context import CryptContext
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-me")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://cloudguard:cloudguard_password@localhost:5440/cloudguard")
    DEMO_MODE: str = "false"
    
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "cloudguard2026@gmail.com")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "quayzjogwfovqesj")
    ALERT_RECEIVER: str = os.getenv("ALERT_RECEIVER", "cloudguard2026@gmail.com")
    PRIMARY_ADMIN_EMAIL: str = os.getenv("PRIMARY_ADMIN_EMAIL", "cloudguard2026@gmail.com")
    
    SKYLAB_SERVER_IP: str = "127.0.0.1"
    SKYLAB_SERVER_USER: str = "admin"
    SKYLAB_SERVER_PASS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_credential(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def decrypt_credential(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
