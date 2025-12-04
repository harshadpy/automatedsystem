import requests
import sys

BASE_URL = "http://localhost:8000"

def test_call():
    # 1. Login as admin
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
        
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create/Get a lead with specific phone
    print("Creating/Getting test lead...")
    test_phone = "+919325642225"
    
    # Check if lead exists
    resp = requests.get(f"{BASE_URL}/leads", headers=headers)
    leads = resp.json()
    target_lead = None
    
    for lead in leads:
        if lead['phone'] == test_phone:
            target_lead = lead
            break
            
    if not target_lead:
        print(f"Creating new lead with phone {test_phone}...")
        resp = requests.post(f"{BASE_URL}/leads", headers=headers, json={
            "name": "Test Call User",
            "email": "test_call@example.com",
            "phone": test_phone,
            "city": "Test City",
            "role": "student"
        })
        if resp.status_code == 200:
            target_lead = resp.json()
        else:
            print(f"Failed to create lead: {resp.text}")
            return
            
    print(f"Testing call for lead: {target_lead['name']} ({target_lead['phone']})")
    
    # 3. Initiate call
    print(f"Initiating call to lead ID {target_lead['id']}...")
    resp = requests.post(f"{BASE_URL}/leads/{target_lead['id']}/call", headers=headers)
    
    if resp.status_code == 200:
        print("✓ Call initiated successfully!")
        print(f"Response: {resp.json()}")
    else:
        print(f"✗ Failed to initiate call: {resp.status_code}")
        try:
            print(f"Response JSON: {resp.json()}")
        except:
            print(f"Response Text: {resp.text}")

if __name__ == "__main__":
    test_call()
