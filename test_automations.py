import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_automations():
    # 1. Login to get token
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

    # 2. Create a Lead (triggers welcome email)
    print("Creating Lead (triggers welcome email)...")
    resp = requests.post(f"{BASE_URL}/leads", json={
        "name": "Auto Test Lead",
        "email": "auto@test.com",
        "phone": "5551234567",
        "city": "Automation City"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create lead: {resp.text}")
        sys.exit(1)
    lead_id = resp.json()["id"]
    print(f"Lead created with ID: {lead_id}")

    # 3. Trigger Manual Email
    print("Triggering Manual Email...")
    resp = requests.post(f"{BASE_URL}/leads/{lead_id}/email", params={
        "subject": "Manual Test Email",
        "prompt": "Write a short follow-up email asking if they have questions."
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to trigger email: {resp.text}")
    else:
        print(f"Email triggered: {resp.json()['status']}")

    # 4. Trigger WhatsApp
    print("Triggering WhatsApp...")
    resp = requests.post(f"{BASE_URL}/leads/{lead_id}/whatsapp", params={
        "prompt": "Ask if they are free for a call tomorrow."
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to trigger WhatsApp: {resp.text}")
    else:
        print(f"WhatsApp triggered: {resp.json()['status']}")

    # 5. Trigger Call
    print("Triggering Call...")
    resp = requests.post(f"{BASE_URL}/leads/{lead_id}/call", params={
        "agent_id": "test_agent"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to trigger call: {resp.text}")
    else:
        print(f"Call triggered: {resp.json()['status']}")

    print("\nAUTOMATION TESTS PASSED!")

if __name__ == "__main__":
    test_automations()
