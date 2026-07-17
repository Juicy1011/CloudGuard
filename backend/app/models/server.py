from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hostname = Column(String, nullable=False, unique=True)
    port = Column(Integer, default=22)
    username = Column(String, nullable=False)
    password = Column(Text, nullable=True)
    private_key = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    last_status = Column(String, default="unknown")
    status_override = Column(String, nullable=True)
    last_seen = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    health_logs = relationship("HealthLog", back_populates="server", cascade="all, delete-orphan")
    container_logs = relationship("ContainerLog", back_populates="server", cascade="all, delete-orphan")
