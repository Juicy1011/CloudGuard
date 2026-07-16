from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.server import Server
from app.models.health import HealthLog, ContainerLog
from app.schemas.server import ServerCreate, ServerView, ServerDetail, HealthLogView, ContainerView
from app.core.security import encrypt_credential

router = APIRouter()

@router.post("/", response_model=ServerView, status_code=status.HTTP_201_CREATED)
def create_server(server: ServerCreate, db: Session = Depends(get_db)):
    db_server = db.query(Server).filter(Server.hostname == server.hostname).first()
    if db_server:
        raise HTTPException(status_code=400, detail="Server with this hostname already exists.")
    
    enc_password = encrypt_credential(server.password) if server.password else None
    enc_key = encrypt_credential(server.private_key) if server.private_key else None
    
    new_server = Server(
        name=server.name,
        hostname=server.hostname,
        port=server.port,
        username=server.username,
        password=enc_password,
        private_key=enc_key
    )
    db.add(new_server)
    db.commit()
    db.refresh(new_server)
    return new_server

@router.get("/", response_model=List[ServerView])
def list_servers(db: Session = Depends(get_db)):
    return db.query(Server).all()

@router.get("/{server_id}", response_model=ServerDetail)
def get_server_detail(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
        
    latest_health = db.query(HealthLog).filter(HealthLog.server_id == server_id).order_by(HealthLog.timestamp.desc()).first()
    containers = db.query(ContainerLog).filter(ContainerLog.server_id == server_id).all()
    
    c_views = [
        ContainerView(
            container_id=c.container_id,
            name=c.name,
            image=c.image,
            status=c.status,
            ports=c.ports,
            cpu_percent=c.cpu_percent,
            memory_percent=c.memory_percent
        ) for c in containers
    ]
    
    h_view = None
    if latest_health:
        h_view = HealthLogView(
            cpu_percent=latest_health.cpu_percent,
            memory_percent=latest_health.memory_percent,
            disk_percent=latest_health.disk_percent,
            uptime=latest_health.uptime,
            latency=latest_health.latency,
            timestamp=latest_health.timestamp
        )
        
    return ServerDetail(
        id=server.id,
        name=server.name,
        hostname=server.hostname,
        port=server.port,
        username=server.username,
        is_active=server.is_active,
        last_status=server.last_status,
        last_seen=server.last_seen,
        latest_health=h_view,
        containers=c_views
    )

@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    db.delete(server)
    db.commit()
    return
