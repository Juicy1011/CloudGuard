from app.database import engine, Base
from app.models.setting import NotificationEmail

def migrate():
    print("Creating notification_emails table in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
