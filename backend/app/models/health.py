from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class HealthLog(Base):
    __tablename__ = "health_logs"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"))
    cpu_percent = Column(Float)
    memory_total = Column(Float)
    memory_used = Column(Float)
    memory_percent = Column(Float)
    disk_total = Column(Float)
    disk_used = Column(Float)
    disk_percent = Column(Float)
    uptime = Column(Float)
    latency = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    server = relationship("Server", back_populates="health_logs")

class ContainerLog(Base):
    __tablename__ = "container_logs"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"))
    container_id = Column(String)
    name = Column(String)
    image = Column(String)
    status = Column(String)
    ports = Column(String)
    cpu_percent = Column(Float, default=0.0)
    memory_percent = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    server = relationship("Server", back_populates="container_logs")
