import requests
import json

BASE_URL = "http://localhost:8000"

def test_manual_enrollment():
    # 1. Login as Admin
    print("1. Logging in as Admin...")
    response = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    if response.status_code != 200:
        print("Login failed")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   ✓ Logged in")

    # 2. Create a Test Lead
    print("\n2. Creating Test Lead...")
    lead_data = {
        "name": "Manual Enroll Test",
        "email": "manual.test@example.com",
        "phone": "+919999999999",
        "city": "Test City",
        "role": "student"
    }
    # Clean up if exists (optional, but good for repeatability)
    # For now, just rely on unique email or ignore error
    
    response = requests.post(f"{BASE_URL}/leads", json=lead_data, headers=headers)
    if response.status_code == 200:
        lead = response.json()
        print(f"   ✓ Lead created (ID: {lead['id']})")
    else:
        # Try to find existing
        leads_resp = requests.get(f"{BASE_URL}/leads", headers=headers)
        leads = leads_resp.json()
        lead = next((l for l in leads if l['email'] == lead_data['email']), None)
        if lead:
             print(f"   ✓ Lead already exists (ID: {lead['id']})")
        else:
             print(f"   ✗ Failed to create/find lead: {response.text}")
             return

    # 3. Manually Enroll Lead
    print("\n3. Manually Enrolling Lead...")
    # Get a batch ID (assuming batch 1 exists)
    batch_id = 1
    
    enroll_resp = requests.post(f"{BASE_URL}/enrollments/from-lead", json={
        "lead_id": lead['id'],
        "batch_id": batch_id
    }, headers=headers)
    
    print(f"   Response Status: {enroll_resp.status_code}")
    print(f"   Response Body: {enroll_resp.text}")
    
    if enroll_resp.status_code == 200:
        data = enroll_resp.json()
        if "credentials sent" in data["message"].lower():
            print("   ✓ Success Message confirms credentials sent")
        else:
            print("   ? Success Message does NOT mention credentials (might be old user)")
            
        # 4. Verify Password Uniqueness
        print("\n4. Verifying Password Uniqueness...")
        login_check = requests.post(f"{BASE_URL}/token", data={
            "username": lead_data['email'],
            "password": "welcome123"
        })
        if login_check.status_code == 401:
            print("   ✓ Default password 'welcome123' rejected (Unique password generated)")
        else:
            print("   ✗ Default password 'welcome123' WORKED (Password not unique)")
            
    else:
        print("   ✗ Enrollment failed")

if __name__ == "__main__":
    test_manual_enrollment()
