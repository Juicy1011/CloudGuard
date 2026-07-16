from app.database import SessionLocal
from app.models.server import Server
from app.models.health import HealthLog, ContainerLog

def clear_db():
    db = SessionLocal()
    try:
        db.query(ContainerLog).delete()
        db.query(HealthLog).delete()
        db.query(Server).delete()
        db.commit()
        print("Database cleared successfully.")
    except Exception as e:
        print(f"Error clearing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_db()
