from app.core.metrics import parse_uptime, parse_cpu, parse_memory, parse_disk, parse_docker

def test_parse_uptime():
    assert parse_uptime("12345.67 89012.34") == 12345.67
    assert parse_uptime("") == 0.0
    assert parse_uptime(None) == 0.0

def test_parse_cpu():
    raw = "%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 93.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st"
    assert parse_cpu(raw) == 7.0
    assert parse_cpu("") == 0.0
    assert parse_cpu(None) == 0.0

def test_parse_memory():
    raw = (
        "               total        used        free      shared  buff/cache   available\n"
        "Mem:            8000        2000        3000         100        3000        5500\n"
        "Swap:           2000           0        2000"
    )
    result = parse_memory(raw)
    assert result["total"] == 8000.0
    assert result["used"] == 2000.0
    assert result["available"] == 5500.0
    assert result["percent"] == 25.0

def test_parse_disk():
    raw = (
        "Filesystem     1M-blocks  Used Available Use% Mounted on\n"
        "/dev/sda1          10000  4000      6000  40% /"
    )
    result = parse_disk(raw)
    assert result["total"] == 10000.0
    assert result["used"] == 4000.0
    assert result["available"] == 6000.0
    assert result["percent"] == 40.0

def test_parse_docker():
    raw = (
        "abc123xyz|my-web-app|Up 2 hours|nginx:alpine|0.0.0.0:80->80/tcp\n"
        "def456uvw|my-db|Exited (0) 5 minutes ago|postgres:15-alpine|"
    )
    raw_stats = (
        "abc123xyz|2.5%|10.5%\n"
        "def456uvw|0.0%|0.0%\n"
    )
    result = parse_docker(raw, raw_stats)
    assert len(result) == 2
    assert result[0]["id"] == "abc123xyz"
    assert result[0]["name"] == "my-web-app"
    assert result[0]["status"] == "Up 2 hours"
    assert result[0]["image"] == "nginx:alpine"
    assert result[0]["ports"] == "0.0.0.0:80->80/tcp"
    assert result[0]["cpu_percent"] == 2.5
    assert result[0]["memory_percent"] == 10.5
    
    assert result[1]["id"] == "def456uvw"
    assert result[1]["name"] == "my-db"
    assert result[1]["status"] == "Exited (0) 5 minutes ago"
    assert result[1]["image"] == "postgres:15-alpine"
    assert result[1]["ports"] == ""
    assert result[1]["cpu_percent"] == 0.0
    assert result[1]["memory_percent"] == 0.0
