from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE servers ADD COLUMN status_override VARCHAR"))
            conn.commit()
            print("Successfully added status_override column to servers table.")
        except Exception as e:
            print(f"Migration error (column might already exist): {e}")

if __name__ == "__main__":
    migrate()