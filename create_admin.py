"""
Create admin user in the database
"""
import requests

BASE_URL = "http://localhost:8000"

# Create admin user
admin_data = {
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
}

print("Creating admin user...")
response = requests.post(f"{BASE_URL}/users", json=admin_data)

if response.status_code == 200:
    print("✓ Admin user created successfully!")
    print(f"  Email: {admin_data['email']}")
    print(f"  Password: {admin_data['password']}")
else:
    print(f"✗ Failed to create admin user: {response.text}")
