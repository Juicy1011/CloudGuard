import os
from cryptography.fernet import Fernet
from passlib.context import CryptContext
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-me")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://cloudguard:cloudguard_password@localhost:5440/cloudguard")
    DEMO_MODE: str = "false"
    SKYLAB_SERVER_IP: str = "127.0.0.1"
    SKYLAB_SERVER_USER: str = "admin"
    SKYLAB_SERVER_PASS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_credential(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def decrypt_credential(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
