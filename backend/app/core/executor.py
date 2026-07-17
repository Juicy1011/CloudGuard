import io
import hashlib
import paramiko
import socket
import random
from app.core.security import settings
from app.core.mock_data import MOCK_MICROSERVICES

def get_mock_metrics(hostname: str, server_name: str = None, status_override: str = None, stopped_containers: list = None) -> dict:
    if status_override == "ssh_fail" or (server_name and "[SSH_FAIL]" in server_name):
        return {"success": False, "error": "SSH Dial Timeouts: connection handshake failed."}

    h = hashlib.md5(hostname.encode()).hexdigest()
    seed = int(h, 16)
    r_select = random.Random(seed)
    
    num_services = r_select.randint(3, 6)
    selected_services = r_select.sample(MOCK_MICROSERVICES, num_services)
    
    docker_ps_lines = []
    docker_stats_lines = []
    
    stopped_set = set(stopped_containers or [])
    
    for i, m in enumerate(selected_services):
        if m['id'] in stopped_set:
            status = "Exited (0) 5 minutes ago"
            cpu = "0.00%"
            mem = "0.00%"
        elif (status_override == "crash" or (server_name and "[CRASH]" in server_name)) and i == 0:
            status = "Exited (1) 2 minutes ago"
            cpu = "0.00%"
            mem = "0.00%"
        else:
            status = m['status']
            cpu = f"{random.uniform(0.1, 15.0):.2f}%"
            mem = f"{random.uniform(1.0, 45.0):.2f}%"

        docker_ps_lines.append(
            f"{m['id']}|{m['name']}|{status}|{m['image']}|{m['ports']}"
        )
        docker_stats_lines.append(
            f"{m['id']}|{cpu}|{mem}"
        )
    
    return {
        "success": True,
        "uptime": f"{random.randint(1000, 1000000)}.00",
        "cpu": f"%Cpu(s): {random.uniform(5, 40):.1f} us, {random.uniform(1, 10):.1f} sy, 0.0 ni, {random.uniform(50, 90):.1f} id",
        "memory": f"Mem: {8000} {random.randint(2000, 6000)} {1000} 100 {1000} {3000}",
        "disk": f"/dev/sda1 {20000} {random.randint(5000, 15000)} {5000} {random.randint(20, 80)}% /",
        "docker": "\n".join(docker_ps_lines),
        "docker_stats": "\n".join(docker_stats_lines)
    }


def execute_ssh_commands(
    hostname: str,
    username: str,
    password: str = None,
    private_key: str = None,
    port: int = 22,
    timeout: float = 10.0,
    server_name: str = None,
    status_override: str = None,
    stopped_containers: list = None
) -> dict:
    if settings.DEMO_MODE == "true":
        return get_mock_metrics(hostname, server_name, status_override, stopped_containers)

    client = paramiko.SSHClient()


    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    pkey = None
    if private_key:
        try:
            pkey = paramiko.RSAKey.from_private_key(io.StringIO(private_key))
        except paramiko.ssh_exception.SSHException:
            try:
                pkey = paramiko.Ed25519Key.from_private_key(io.StringIO(private_key))
            except Exception:
                pass

    try:
        client.connect(
            hostname=hostname,
            port=port,
            username=username,
            password=password,
            pkey=pkey,
            timeout=timeout,
            banner_timeout=timeout,
            auth_timeout=timeout
        )
    except (socket.timeout, paramiko.SSHException, paramiko.AuthenticationException) as e:
        return {"success": False, "error": str(e)}

    metrics = {"success": True}
    
    commands = {
        "uptime": "cat /proc/uptime",
        "cpu": "top -bn1 | grep -i 'cpu(s)'",
        "memory": "free -m",
        "disk": "df -m /",
        "docker": "docker ps -a --format '{{.ID}}|{{.Names}}|{{.Status}}|{{.Image}}|{{.Ports}}' 2>/dev/null",
        "docker_stats": "docker stats --no-stream --format '{{.ID}}|{{.CPUPerc}}|{{.MemPerc}}' 2>/dev/null"
    }
    
    for key, cmd in commands.items():
        try:
            stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
            exit_status = stdout.channel.recv_exit_status()
            if exit_status == 0 or key in ("docker", "docker_stats"):
                metrics[key] = stdout.read().decode("utf-8", errors="ignore")
            else:
                metrics[key] = None
        except Exception:
            metrics[key] = None
            
    client.close()
    return metrics
