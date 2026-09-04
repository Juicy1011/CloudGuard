import asyncio
import time
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.server import Server
from app.models.health import HealthLog, ContainerLog
from app.core.probe import ping_host
from app.core.executor import execute_ssh_commands
from app.core.metrics import parse_all_metrics
from app.core.security import decrypt_credential
from app.core.incident import send_incident_email

import asyncio
import time
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.server import Server
from app.models.health import HealthLog, ContainerLog
from app.core.probe import ping_host
from app.core.executor import execute_ssh_commands
from app.core.metrics import parse_all_metrics
from app.core.security import decrypt_credential
from app.core.incident import send_incident_email

async def monitor_servers():
    print("Worker started. Monitoring loop initiated...")
    container_states = {}

    while True:
        db = SessionLocal()
        try:
            servers = db.query(Server).filter(Server.is_active == True).all()
            print(f"Checking {len(servers)} servers...")
            for server in servers:
                print(f"Probing {server.name} ({server.hostname})...")
                is_alive, latency = await ping_host(server.hostname, server_name=server.name, status_override=server.status_override)
                print(f"Ping result: {is_alive}, latency: {latency}")
                
                if not is_alive:
                    if server.last_status != "offline":
                        server.last_status = "offline"
                        await asyncio.to_thread(
                            send_incident_email,
                            server_name=server.name,
                            hostname=server.hostname,
                            error="Host is unreachable via ICMP ping.",
                            severity="CRITICAL",
                            action_hint="Verify the host is powered on and check firewall rules for ICMP/Ping traffic.",
                            db_session=db
                        )
                    db.commit()
                    continue

                password = decrypt_credential(server.password) if server.password else None
                private_key = decrypt_credential(server.private_key) if server.private_key else None
                
                raw_metrics = execute_ssh_commands(
                    hostname=server.hostname,
                    username=server.username,
                    password=password,
                    private_key=private_key,
                    port=server.port,
                    server_name=server.name,
                    status_override=server.status_override,
                    stopped_containers=server.stopped_containers
                )
                
                metrics = parse_all_metrics(raw_metrics)
                
                if metrics["success"]:
                    server.last_status = "online"
                    health = HealthLog(
                        server_id=server.id,
                        cpu_percent=metrics["cpu_percent"],
                        memory_total=metrics["memory"]["total"],
                        memory_used=metrics["memory"]["used"],
                        memory_percent=metrics["memory"]["percent"],
                        disk_total=metrics["disk"]["total"],
                        disk_used=metrics["disk"]["used"],
                        disk_percent=metrics["disk"]["percent"],
                        uptime=metrics["uptime"],
                        latency=latency
                    )
                    db.add(health)
                    
                    if server.id not in container_states:
                        container_states[server.id] = {}

                    db.query(ContainerLog).filter(ContainerLog.server_id == server.id).delete()
                    for container in metrics["containers"]:
                        c_id = container["id"]
                        status = container["status"]
                        is_running = status.lower().startswith("up")
                        
                        prev_state = container_states[server.id].get(c_id)
                        if prev_state is True and not is_running:
                            await asyncio.to_thread(
                                send_incident_email,
                                server_name=server.name,
                                hostname=server.hostname,
                                error=f"Microservice entered unhealthy state: {status}",
                                component_type="container",
                                component_name=container["name"],
                                severity="WARNING",
                                action_hint="Inspect container logs on the host or attempt a 'Restart' via the dashboard.",
                                db_session=db
                            )
                        
                        container_states[server.id][c_id] = is_running

                        clog = ContainerLog(
                            server_id=server.id,
                            container_id=c_id,
                            name=container["name"],
                            image=container["image"],
                            status=status,
                            ports=container["ports"],
                            cpu_percent=container["cpu_percent"],
                            memory_percent=container["memory_percent"]
                        )
                        db.add(clog)
                    
                    server.last_seen = func.now()
                else:
                    if server.last_status != "ssh_fail":
                        server.last_status = "ssh_fail"
                        await asyncio.to_thread(
                            send_incident_email,
                            server_name=server.name,
                            hostname=server.hostname,
                            error=f"SSH Handshake Failure: {metrics.get('error')}",
                            severity="CRITICAL",
                            action_hint="Check SSH credentials in the Access Control Vault and ensure Port 22 is open.",
                            db_session=db
                        )

                db.commit()
        except Exception as e:
            print(f"Error in monitor loop: {e}")
        finally:
            db.close()
            
        await asyncio.sleep(5)



if __name__ == "__main__":
    asyncio.run(monitor_servers())

