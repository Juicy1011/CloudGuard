from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.health import HealthLog
from app.schemas.server import HealthLogView

router = APIRouter()

@router.get("/{server_id}/history", response_model=List[HealthLogView])
def get_server_history(server_id: int, limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(HealthLog).filter(HealthLog.server_id == server_id).order_by(HealthLog.timestamp.desc()).limit(limit).all()
    return logs
