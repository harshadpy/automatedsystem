import requests

BASE_URL = "http://localhost:8000"

def test_signup_and_login():
    email = "debug_student@example.com"
    password = "password123"
    name = "Debug Student"

    # 1. Signup
    print(f"Attempting signup for {email}...")
    signup_payload = {
        "name": name,
        "email": email,
        "password": password,
        "role": "student"
    }
    response = requests.post(f"{BASE_URL}/users", json=signup_payload)
    
    if response.status_code == 200:
        print("Signup successful!")
        print(response.json())
    elif response.status_code == 400 and "already registered" in response.text:
         print("User already exists, proceeding to login...")
    else:
        print(f"Signup failed: {response.status_code} - {response.text}")
        return

    # 2. Login
    print(f"Attempting login for {email}...")
    login_payload = {
        "username": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/token", data=login_payload)

    if response.status_code == 200:
        print("Login successful!")
        print(response.json())
    else:
        print(f"Login failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_signup_and_login()
