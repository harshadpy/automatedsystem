import requests

# Test login
url = "http://localhost:8000/token"
data = {
    "username": "admin@example.com",
    "password": "admin123"
}

print("Testing login with:")
print(f"  Email: {data['username']}")
print(f"  Password: {data['password']}")
print()

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("\n✓ Login successful!")
        print(f"Token: {response.json()['access_token'][:50]}...")
    else:
        print("\n✗ Login failed!")
        
except Exception as e:
    print(f"Error: {e}")
