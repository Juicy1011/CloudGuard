from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.server import Server
from app.models.health import HealthLog
from app.schemas.server import HealthLogView
from app.core.security import decode_access_token

router = APIRouter()

def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing or invalid"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return int(payload["sub"])

@router.get("/trend")
def get_fleet_trend(
    range: str = "7d",
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    bucket_config = {
        "24h": (timedelta(hours=24), "hour"),
        "7d":  (timedelta(days=7),   "day"),
        "30d": (timedelta(days=30),  "day"),
    }
    window, trunc_unit = bucket_config.get(range, bucket_config["7d"])
    since = datetime.now(timezone.utc) - window

    bucket = func.date_trunc(trunc_unit, HealthLog.timestamp)

    rows = (
        db.query(
            bucket.label("bucket"),
            func.avg(HealthLog.latency).label("latency"),
            func.avg(HealthLog.cpu_percent).label("cpu"),
            func.avg(HealthLog.memory_percent).label("memory"),
        )
        .join(Server, Server.id == HealthLog.server_id)
        .filter(Server.owner_id == current_user_id, HealthLog.timestamp >= since)
        .group_by(bucket)
        .order_by(bucket)
        .all()
    )

    return [
        {
            "label": r.bucket.strftime("%H:%M") if trunc_unit == "hour" else r.bucket.strftime("%b %d"),
            "latency": round(r.latency or 0, 1),
            "cpu": round(r.cpu or 0, 1),
            "memory": round(r.memory or 0, 1)
        }
        for r in rows
    ]

@router.get("/{server_id}/history", response_model=List[HealthLogView])
def get_server_history(
    server_id: int,
    limit: int = 20,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    server = db.query(Server).filter(Server.id == server_id, Server.owner_id == current_user_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    logs = db.query(HealthLog).filter(HealthLog.server_id == server_id).order_by(HealthLog.timestamp.desc()).limit(limit).all()
    return logs
