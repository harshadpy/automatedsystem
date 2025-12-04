import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_backend():
    # 1. Create Admin
    print("Creating Admin...")
    try:
        resp = requests.post(f"{BASE_URL}/users", json={
            "name": "Admin",
            "email": "admin@example.com",
            "password": "admin123",
            "role": "admin"
        })
        if resp.status_code == 200:
            print("Admin created.")
        elif resp.status_code == 400 and "already registered" in resp.text:
            print("Admin already exists.")
        else:
            print(f"Failed to create admin: {resp.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

    # 2. Login
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        sys.exit(1)
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 3. Create Lead
    print("Creating Lead...")
    resp = requests.post(f"{BASE_URL}/leads", json={
        "name": "Test Lead",
        "email": "test@lead.com",
        "phone": "1234567890",
        "city": "Test City"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create lead: {resp.status_code} - {resp.text}")
        print(f"History: {resp.history}")
        sys.exit(1)
    print("Lead created.")

    # 4. List Leads
    print("Listing Leads...")
    resp = requests.get(f"{BASE_URL}/leads", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to list leads: {resp.text}")
        sys.exit(1)
    leads = resp.json()
    print(f"Found {len(leads)} leads.")

    # 5. Upload CSV
    print("Uploading CSV...")
    with open("leads.csv", "rb") as f:
        files = {"file": ("leads.csv", f, "text/csv")}
        resp = requests.post(f"{BASE_URL}/leads/upload", files=files, headers=headers)
    
    if resp.status_code != 200:
        print(f"Failed to upload CSV: {resp.text}")
        sys.exit(1)
    print(f"CSV Upload response: {resp.json()}")

    print("\nALL TESTS PASSED!")

if __name__ == "__main__":
    test_backend()
