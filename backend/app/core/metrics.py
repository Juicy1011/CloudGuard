import re

def parse_uptime(raw: str | None) -> float:
    if not raw:
        return 0.0
    try:
        parts = raw.split()
        if parts:
            return float(parts[0])
    except Exception:
        pass
    return 0.0

def parse_cpu(raw: str | None) -> float:
    if not raw:
        return 0.0
    try:
        match = re.search(r"(?:id|us|sy|ni|wa|hi|si|st),\s*([\d\.]+)\s*id", raw)
        if match:
            idle = float(match.group(1))
            return round(100.0 - idle, 2)
        match_alt = re.search(r"([\d\.]+)\s*id", raw)
        if match_alt:
            idle = float(match_alt.group(1))
            return round(100.0 - idle, 2)
    except Exception:
        pass
    return 0.0

def parse_memory(raw: str | None) -> dict:
    result = {"total": 0.0, "used": 0.0, "available": 0.0, "percent": 0.0}
    if not raw:
        return result
    try:
        for line in raw.splitlines():
            if line.startswith("Mem:"):
                parts = line.split()
                if len(parts) >= 7:
                    result["total"] = float(parts[1])
                    result["used"] = float(parts[2])
                    result["available"] = float(parts[6])
                    if result["total"] > 0:
                        result["percent"] = round((result["used"] / result["total"]) * 100.0, 2)
                elif len(parts) >= 4:
                    result["total"] = float(parts[1])
                    result["used"] = float(parts[2])
                    result["available"] = float(parts[3])
                    if result["total"] > 0:
                        result["percent"] = round((result["used"] / result["total"]) * 100.0, 2)
    except Exception:
        pass
    return result

def parse_disk(raw: str | None) -> dict:
    result = {"total": 0.0, "used": 0.0, "available": 0.0, "percent": 0.0}
    if not raw:
        return result
    try:
        lines = raw.splitlines()
        if len(lines) >= 2:
            parts = lines[1].split()
            if len(parts) >= 6:
                result["total"] = float(parts[1])
                result["used"] = float(parts[2])
                result["available"] = float(parts[3])
                pct_str = parts[4].replace("%", "")
                result["percent"] = float(pct_str)
    except Exception:
        pass
    return result

def parse_docker(raw_ps: str | None, raw_stats: str | None) -> list[dict]:
    containers = []
    if not raw_ps:
        return containers
        
    stats_map = {}
    if raw_stats:
        try:
            for line in raw_stats.strip().splitlines():
                parts = line.split("|")
                if len(parts) >= 3:
                    container_id = parts[0].strip()
                    cpu_str = parts[1].strip().replace("%", "")
                    mem_str = parts[2].strip().replace("%", "")
                    
                    try:
                        cpu_val = float(cpu_str)
                    except ValueError:
                        cpu_val = 0.0
                    try:
                        mem_val = float(mem_str)
                    except ValueError:
                        mem_val = 0.0
                        
                    stats_map[container_id] = {
                        "cpu_percent": cpu_val,
                        "memory_percent": mem_val
                    }
        except Exception:
            pass

    try:
        for line in raw_ps.strip().splitlines():
            parts = line.split("|")
            if len(parts) >= 4:
                cid = parts[0].strip()
                stats = stats_map.get(cid)
                if not stats:
                    for k, v in stats_map.items():
                        if k.startswith(cid) or cid.startswith(k):
                            stats = v
                            break
                            
                cpu_val = stats["cpu_percent"] if stats else 0.0
                mem_val = stats["memory_percent"] if stats else 0.0
                
                containers.append({
                    "id": cid,
                    "name": parts[1].strip(),
                    "status": parts[2].strip(),
                    "image": parts[3].strip(),
                    "ports": parts[4].strip() if len(parts) > 4 else "",
                    "cpu_percent": cpu_val,
                    "memory_percent": mem_val
                })
    except Exception:
        pass
    return containers

def parse_all_metrics(raw_data: dict) -> dict:
    if not raw_data.get("success", False):
        return {
            "success": False,
            "error": raw_data.get("error", "Failed to collect metrics")
        }
    
    return {
        "success": True,
        "uptime": parse_uptime(raw_data.get("uptime")),
        "cpu_percent": parse_cpu(raw_data.get("cpu")),
        "memory": parse_memory(raw_data.get("memory")),
        "disk": parse_disk(raw_data.get("disk")),
        "containers": parse_docker(raw_data.get("docker"), raw_data.get("docker_stats"))
    }
