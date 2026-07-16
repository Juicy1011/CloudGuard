from app.database import engine, Base
from app.models.server import Server
from app.models.user import User
from app.models.health import HealthLog, ContainerLog

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()
