from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ServerBase(BaseModel):
    name: str
    hostname: str
    port: int = 22
    username: str

class ServerCreate(ServerBase):
    password: Optional[str] = None
    private_key: Optional[str] = None

class ServerView(ServerBase):
    id: int
    is_active: bool
    last_status: str
    status_override: Optional[str] = None
    stopped_containers: Optional[List[str]] = []
    last_seen: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChaosTrigger(BaseModel):
    override: Optional[str] = None

class ContainerAction(BaseModel):
    action: str = Field(..., description="Action to perform: stop, start, restart")


class ContainerView(BaseModel):
    container_id: str
    name: str
    image: str
    status: str
    ports: str
    cpu_percent: float
    memory_percent: float

    class Config:
        from_attributes = True

class HealthLogView(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    uptime: float
    latency: float
    timestamp: datetime

    class Config:
        from_attributes = True

class ServerDetail(ServerView):
    latest_health: Optional[HealthLogView] = None
    containers: List[ContainerView] = []

    class Config:
        from_attributes = True
