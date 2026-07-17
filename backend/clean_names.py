from app.database import SessionLocal
from app.models.server import Server

def clean_names():
    db = SessionLocal()
    try:
        servers = db.query(Server).all()
        for server in servers:
            clean_name = server.name
            for suffix in [" [OFFLINE]", " [SSH_FAIL]", " [CRASH]"]:
                if clean_name.endswith(suffix):
                    clean_name = clean_name[:-len(suffix)]
            if clean_name != server.name:
                print(f"Renaming '{server.name}' to '{clean_name}'")
                server.name = clean_name
        db.commit()
    except Exception as e:
        print(f"Error cleaning names: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_names()