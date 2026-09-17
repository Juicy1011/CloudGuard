from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.server import Server
from app.models.health import HealthLog, ContainerLog
from app.schemas.server import ServerCreate, ServerView, ServerDetail, HealthLogView, ContainerView, ChaosTrigger, ContainerAction
from app.core.security import encrypt_credential, decrypt_credential, decode_access_token, settings
import io
import paramiko

router = APIRouter()

def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        return int(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed user identity token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/", response_model=ServerView, status_code=status.HTTP_201_CREATED)
def create_server(server: ServerCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    db_server = db.query(Server).filter(
        Server.hostname == server.hostname,
        Server.owner_id == current_user_id
    ).first()
    if db_server:
        raise HTTPException(status_code=400, detail="Server with this hostname already exists in your workspace.")
    
    enc_password = encrypt_credential(server.password) if server.password else None
    enc_key = encrypt_credential(server.private_key) if server.private_key else None
    
    new_server = Server(
        name=server.name,
        hostname=server.hostname,
        port=server.port,
        username=server.username,
        password=enc_password,
        private_key=enc_key,
        owner_id=current_user_id
    )
    db.add(new_server)
    db.commit()
    db.refresh(new_server)
    return new_server

@router.get("/", response_model=List[ServerView])
def list_servers(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    return db.query(Server).filter(Server.owner_id == current_user_id).all()

@router.get("/{server_id}", response_model=ServerDetail)
def get_server_detail(server_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user_id
    ).first()
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
        status_override=server.status_override,
        stopped_containers=server.stopped_containers,
        last_seen=server.last_seen,
        latest_health=h_view,
        containers=c_views
    )

@router.get("/{server_id}/reveal-credentials")
def reveal_server_credentials(
    server_id: int, 
    db: Session = Depends(get_db), 
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    query = db.query(Server).filter(Server.id == server_id)
    if current_user_id is not None:
        query = query.filter(Server.owner_id == current_user_id)
    server = query.first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found or unauthorized")
        
    plain_password = decrypt_credential(server.password) if server.password else None
    plain_key = decrypt_credential(server.private_key) if server.private_key else None
    
    return {
        "server_id": server.id,
        "username": server.username,
        "password": plain_password,
        "private_key": plain_key
    }

@router.post("/{server_id}/chaos", response_model=ServerView)
def trigger_chaos(server_id: int, trigger: ChaosTrigger, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user_id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    valid_overrides = {None, "offline", "ssh_fail", "crash"}
    if trigger.override not in valid_overrides:
        raise HTTPException(status_code=400, detail="Invalid override value")
        
    server.status_override = trigger.override
    db.commit()
    db.refresh(server)
    return server

@router.post("/{server_id}/containers/{container_id}/action")
def manage_container(server_id: int, container_id: str, payload: ContainerAction, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user_id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
        
    action = payload.action.lower()
    if action not in ("stop", "start", "restart"):
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'stop', 'start', or 'restart'")

    action_past = "stopped" if action == "stop" else ("started" if action == "start" else "restarted")

    if settings.DEMO_MODE == "true":
        stopped = list(server.stopped_containers or [])
        if action == "stop":
            if container_id not in stopped:
                stopped.append(container_id)
        elif action == "start":
            if container_id in stopped:
                stopped.remove(container_id)
        elif action == "restart":
            if container_id in stopped:
                stopped.remove(container_id)
        
        server.stopped_containers = stopped

        new_status = "Exited (0) 5 seconds ago" if action == "stop" else "Up 5 seconds"
        clog = db.query(ContainerLog).filter(
            ContainerLog.server_id == server_id,
            ContainerLog.container_id == container_id
        ).first()
        if clog:
            clog.status = new_status
            if action == "stop":
                clog.cpu_percent = 0.0
                clog.memory_percent = 0.0

        db.commit()
        db.refresh(server)
        return {"message": f"Demo: Container {container_id} {action_past} successfully."}
        
    else:
        password = decrypt_credential(server.password) if server.password else None
        private_key = decrypt_credential(server.private_key) if server.private_key else None
        
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        pkey = None
        if private_key:
            try:
                pkey = paramiko.RSAKey.from_private_key(io.StringIO(private_key))
            except Exception:
                try:
                    pkey = paramiko.Ed25519Key.from_private_key(io.StringIO(private_key))
                except Exception:
                    pass
                    
        try:
            client.connect(
                hostname=server.hostname,
                port=server.port,
                username=server.username,
                password=password,
                pkey=pkey,
                timeout=10.0
            )
            cmd = f"docker stop -t 1 {container_id}" if action == "stop" else f"docker {action} {container_id}"
            stdin, stdout, stderr = client.exec_command(cmd, timeout=10.0)
            exit_status = stdout.channel.recv_exit_status()
            
            if exit_status != 0:
                err_msg = stderr.read().decode("utf-8", errors="ignore").strip()
                raise HTTPException(status_code=500, detail=f"Docker command failed: {err_msg}")
                
            stopped = list(server.stopped_containers or [])
            if action == "stop" and container_id not in stopped:
                stopped.append(container_id)
            elif action in ("start", "restart") and container_id in stopped:
                stopped.remove(container_id)
                
            server.stopped_containers = stopped
            
            new_status = "Exited (0) 5 seconds ago" if action == "stop" else "Up 5 seconds"
            clog = db.query(ContainerLog).filter(
                ContainerLog.server_id == server_id,
                ContainerLog.container_id == container_id
            ).first()
            if clog:
                clog.status = new_status
                if action == "stop":
                    clog.cpu_percent = 0.0
                    clog.memory_percent = 0.0

            db.commit()
            
            return {"message": f"Container {container_id} {action_past} successfully."}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"SSH connection/execution failed: {str(e)}")
        finally:
            client.close()

@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(server_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user_id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    db.delete(server)
    db.commit()
    return
