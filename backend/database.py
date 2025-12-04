from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB URL from env or fallback to SQLite
database_url = os.getenv("DATABASE_URL", "sqlite:///database_v3.db")

# Fix for Render's postgres:// usage (SQLAlchemy requires postgresql://)
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in database_url:
    connect_args["check_same_thread"] = False

engine = create_engine(database_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
