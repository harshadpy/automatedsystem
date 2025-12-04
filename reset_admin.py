import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Check if user table exists and has data
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
if cursor.fetchone():
    cursor.execute("SELECT id, name, email, role FROM user WHERE email='admin@example.com'")
    user = cursor.fetchone()
    if user:
        print(f"User found: {user}")
        
        # Delete the old user
        cursor.execute("DELETE FROM user WHERE email='admin@example.com'")
        conn.commit()
        print("Deleted old user")
    else:
        print("No user found with email admin@example.com")
else:
    print("User table doesn't exist yet")

# Create new admin user with correct password hash
hashed_password = pwd_context.hash("admin123")
cursor.execute(
    "INSERT INTO user (name, email, role, hashed_password) VALUES (?, ?, ?, ?)",
    ("Admin", "admin@example.com", "admin", hashed_password)
)
conn.commit()
print("Created new admin user with email: admin@example.com and password: admin123")

# Verify
cursor.execute("SELECT id, name, email, role FROM user WHERE email='admin@example.com'")
print("Verified user:", cursor.fetchone())

conn.close()
