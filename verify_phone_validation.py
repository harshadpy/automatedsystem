import requests

BASE_URL = "http://localhost:8000"

def test_validation():
    print("Testing Phone Validation...")
    
    # 1. Login as admin
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Try creating lead with invalid phone (9 digits)
    print("\nAttempting to create lead with invalid phone '932564225'...")
    resp = requests.post(f"{BASE_URL}/leads", headers=headers, json={
        "name": "Invalid Phone User",
        "email": "invalid_phone@example.com",
        "phone": "932564225", # Invalid
        "city": "Test City",
        "role": "student"
    })
    
    if resp.status_code == 422:
        print("✓ Correctly rejected invalid phone (422 Unprocessable Entity)")
        print(f"Response: {resp.text}")
    else:
        print(f"✗ Failed to reject invalid phone. Status: {resp.status_code}")
        print(f"Response: {resp.text}")

    # 3. Try creating lead with valid phone
    print("\nAttempting to create lead with valid phone '9325642225'...")
    resp = requests.post(f"{BASE_URL}/leads", headers=headers, json={
        "name": "Valid Phone User",
        "email": "valid_phone_test@example.com",
        "phone": "9325642225", # Valid (10 digits)
        "city": "Test City",
        "role": "student"
    })
    
    if resp.status_code == 200:
        print("✓ Correctly accepted valid phone")
    elif resp.status_code == 400 and "already registered" in resp.text:
        print("✓ Valid phone accepted (user already exists)")
    else:
        print(f"✗ Failed to accept valid phone. Status: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_validation()
