import requests
import json

BASE_URL = "http://localhost:8000"

def test_manual_email_content():
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
        "name": "Email Content Test",
        "email": "email.content.test@example.com",
        "phone": "+918888888888",
        "city": "Test City",
        "role": "student"
    }
    
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

    # 3. Send Manual Email
    print("\n3. Sending Manual Email...")
    # Using the message from the frontend update
    message = 'We are excited to have you interested in our Python Mastery Program. Our course offers comprehensive training, hands-on projects, and expert mentorship to help you become a proficient Python developer.\n\nWe would love to discuss your learning goals. Please feel free to reply to this email or reach out to us directly.'
    
    email_resp = requests.post(f"{BASE_URL}/leads/{lead['id']}/notify/email", params={
        "subject": "Welcome to Python Coaching",
        "prompt": message
    }, headers=headers)
    
    print(f"   Response Status: {email_resp.status_code}")
    print(f"   Response Body: {email_resp.text}")
    
    if email_resp.status_code == 200:
        print("   ✓ Email sent successfully (Backend accepted the request)")
    else:
        print("   ✗ Email sending failed")

if __name__ == "__main__":
    test_manual_email_content()
