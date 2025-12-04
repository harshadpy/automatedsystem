import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

url = os.getenv("DATABASE_URL")
print(f"DEBUG: DATABASE_URL from env is: {url}")

if not url:
    print("ERROR: DATABASE_URL is not set!")
    exit(1)

if "sqlite" in url:
    print("WARNING: It looks like you are using SQLite, not PostgreSQL!")

try:
    engine = create_engine(url)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("SUCCESS: Connected to database!")
        
        # Check for tables
        result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in result]
        print(f"Found tables: {tables}")
        
except Exception as e:
    print(f"ERROR: Failed to connect: {e}")
