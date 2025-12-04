import requests
import json

BASE_URL = "http://localhost:8000"

def debug_endpoint():
    print("Debugging Email Endpoint...")

    # We need to find a valid lead ID first
    # Let's try to get leads
    try:
        # Assuming we have a public or auth-less way, or we use the admin token
        # Let's try to login as admin first to get a token
        login_response = requests.post(f"{BASE_URL}/token", data={"username": "admin@example.com", "password": "admin123"})
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get leads
        leads_response = requests.get(f"{BASE_URL}/leads", headers=headers)
        if leads_response.status_code != 200:
            print(f"❌ Failed to fetch leads: {leads_response.text}")
            return
            
        leads = leads_response.json()
        if not leads:
            print("❌ No leads found to test with.")
            return
            
        target_lead = leads[0]
        print(f"Target Lead: {target_lead['name']} (ID: {target_lead['id']})")
        
        # Try sending email via endpoint
        payload = {
            "lead_id": target_lead['id'],
            "subject": "Debug Endpoint Email",
            "message": "This is a test from debug_email_endpoint.py"
        }
        
        print("Sending request to /communications/email...")
        response = requests.post(f"{BASE_URL}/communications/email", json=payload, headers=headers)
        
        if response.status_code == 200:
            print("✅ Endpoint success!")
            print(response.json())
        else:
            print(f"❌ Endpoint failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    debug_endpoint()
