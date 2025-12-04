import requests
import sys
import random
import string

BASE_URL = "http://localhost:8000"

def get_auth_token():
    # Try to login with default admin
    username = "admin@example.com"
    password = "adminpassword"
    
    response = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    
    # If login fails, create a new admin user
    print("Creating new admin user...")
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    username = f"admin_{random_suffix}@example.com"
    user_data = {
        "name": "Test Admin",
        "email": username,
        "password": password,
        "role": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/users", json=user_data)
    if response.status_code == 200:
        print(f"✅ Created admin user: {username}")
        # Login with new user
        response = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
        if response.status_code == 200:
            return response.json()["access_token"]
    
    print(f"❌ Failed to create/login admin user: {response.text}")
    return None

def test_email_system():
    print("Testing Email System...")
    
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed. Exiting.")
        return
        
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a test lead
    lead_data = {
        "name": "Test Student",
        "email": "test.student@example.com",
        "phone": "9876543210",
        "city": "Test City",
        "role": "student"
    }
    try:
        response = requests.post(f"{BASE_URL}/leads", json=lead_data, headers=headers)
        if response.status_code == 200:
            lead = response.json()
            lead_id = lead['id']
            print(f"✅ Created test lead with ID: {lead_id}")
        else:
            print(f"❌ Failed to create lead: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating lead: {e}")
        return

    # 2. Send an email
    email_data = {
        "lead_id": lead_id,
        "subject": "Test Email Subject",
        "message": "This is a test email message from the verification script."
    }
    try:
        response = requests.post(f"{BASE_URL}/communications/email", json=email_data, headers=headers)
        if response.status_code == 200:
            print("✅ Email sent successfully")
        else:
            print(f"❌ Failed to send email: {response.text}")
    except Exception as e:
        print(f"❌ Error sending email: {e}")

    # 3. Verify communication log
    try:
        response = requests.get(f"{BASE_URL}/communications/{lead_id}", headers=headers)
        if response.status_code == 200:
            logs = response.json()
            if len(logs) > 0 and logs[0]['subject'] == "Test Email Subject":
                print(f"✅ Communication log verified. Found {len(logs)} logs.")
                print(f"   Log content: {logs[0]}")
            else:
                # Check if any log matches
                found = False
                for log in logs:
                    if log.get('subject') == "Test Email Subject" or "Test Email Subject" in log.get('content', ''):
                        found = True
                        print(f"✅ Communication log verified. Found matching log.")
                        break
                if not found:
                    print(f"❌ Communication log verification failed. Logs: {logs}")
        else:
            print(f"❌ Failed to fetch communication logs: {response.text}")
    except Exception as e:
        print(f"❌ Error fetching logs: {e}")

    # Cleanup (optional)
    # requests.delete(f"{BASE_URL}/leads/{lead_id}", headers=headers)

if __name__ == "__main__":
    test_email_system()
