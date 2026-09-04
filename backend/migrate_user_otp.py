from sqlalchemy import create_engine, text
from app.core.security import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Migrating users table...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR NULL;"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP WITH TIME ZONE NULL;"))
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    run_migration()
