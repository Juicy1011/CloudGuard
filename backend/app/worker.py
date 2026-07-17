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
                        send_incident_email(server.name, server.hostname, "Server is unreachable via ICMP ping.")
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
                    
                    db.query(ContainerLog).filter(ContainerLog.server_id == server.id).delete()
                    for container in metrics["containers"]:
                        clog = ContainerLog(
                            server_id=server.id,
                            container_id=container["id"],
                            name=container["name"],
                            image=container["image"],
                            status=container["status"],
                            ports=container["ports"],
                            cpu_percent=container["cpu_percent"],
                            memory_percent=container["memory_percent"]
                        )
                        db.add(clog)
                    
                    server.last_seen = func.now()
                else:
                    if server.last_status != "ssh_fail":
                        server.last_status = "ssh_fail"
                        send_incident_email(server.name, server.hostname, f"SSH Connection Failed: {metrics.get('error')}")

                db.commit()
        except Exception as e:
            print(f"Error in monitor loop: {e}")
        finally:
            db.close()
            
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(monitor_servers())

