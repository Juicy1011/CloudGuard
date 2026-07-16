from app.database import SessionLocal
from app.models.server import Server
from app.core.security import encrypt_credential, settings

SERVERS_TO_SEED = [
    {
        "name": "Skylab Production [OFFLINE]",
        "hostname": settings.SKYLAB_SERVER_IP,
        "port": 22,
        "username": settings.SKYLAB_SERVER_USER,
        "password": settings.SKYLAB_SERVER_PASS
    },
    {
        "name": "Skylab Staging [SSH_FAIL]",
        "hostname": "192.168.10.50",
        "port": 22,
        "username": "staging-admin",
        "password": "staging-password"
    },
    {
        "name": "Helios Database [CRASH]",
        "hostname": "192.168.10.100",
        "port": 22,
        "username": "db-operator",
        "password": "db-operator-password"
    },
    {
        "name": "Zenith Analytics",
        "hostname": "192.168.10.150",
        "port": 22,
        "username": "analytics-user",
        "password": "analytics-password"
    }
]

def seed_db():
    db = SessionLocal()
    try:
        for s in SERVERS_TO_SEED:
            exists = db.query(Server).filter(Server.hostname == s["hostname"]).first()
            if not exists:
                host_server = Server(
                    name=s["name"],
                    hostname=s["hostname"],
                    port=s["port"],
                    username=s["username"],
                    password=encrypt_credential(s["password"]) if s["password"] else None
                )
                db.add(host_server)
                db.commit()
                print(f"Database seeded with {host_server.name} ({host_server.hostname})")
            else:
                print(f"Host server {s['name']} already exists.")

    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
