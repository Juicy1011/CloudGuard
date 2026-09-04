import asyncio
import re
import sys
import random
from typing import Optional
from app.core.security import settings

async def ping_host(ip_address: str, timeout: float = 2.0, server_name: Optional[str] = None, status_override: Optional[str] = None) -> tuple[bool, float]:
    if status_override == "offline":
        return False, 0.0
    if settings.DEMO_MODE == "true":
        if server_name and "[OFFLINE]" in server_name:
            return False, 0.0
        return True, random.uniform(5, 50)

    is_win = sys.platform.startswith("win")


    if is_win:
        cmd = ["ping", "-n", "1", "-w", str(int(timeout * 1000)), ip_address]
    else:
        cmd = ["ping", "-c", "1", "-W", str(timeout), ip_address]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        
        if proc.returncode != 0:
            return False, 0.0
            
        output = stdout.decode("utf-8", errors="ignore")
        
        match = re.search(r"time=([\d\.]+)\s*ms", output)
        if match:
            latency = float(match.group(1))
            return True, latency
        
        return True, 1.0
        
    except Exception:
        return False, 0.0
