"""
Simple startup script - run this ONCE after deleting database
"""
import time
import requests

BASE_URL = "http://localhost:8000"

print("Waiting for server to start...")
time.sleep(3)

# Create admin
print("\n1. Creating admin user...")
response = requests.post(f"{BASE_URL}/users", json={
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
})
if response.status_code == 200:
    print("   ✓ Admin created")
else:
    print(f"   - Admin already exists")

# Login
print("\n2. Logging in...")
response = requests.post(f"{BASE_URL}/token", data={
    "username": "admin@example.com",
    "password": "admin123"
})
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("   ✓ Logged in")

# Create courses
print("\n3. Creating courses...")
courses_data = [
    {"title": "Python for Beginners", "description": "Learn Python from scratch.", "price": 5000},
    {"title": "Advanced Python", "description": "Master advanced concepts.", "price": 7500},
    {"title": "Data Science with Python", "description": "Learn data analysis.", "price": 10000}
]

for course in courses_data:
    response = requests.post(f"{BASE_URL}/courses", json=course, headers=headers)
    if response.status_code == 200:
        print(f"   ✓ {course['title']}")

print("\n✅ Setup complete! Now refresh your browser.")
print("   Login with: admin@example.com / admin123")
