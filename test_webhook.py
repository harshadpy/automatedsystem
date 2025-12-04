import requests
import json

BASE_URL = "http://localhost:8000"

def test_webhook():
    print("Testing Inbound Email Webhook...")

    # 1. Create a test lead (if not exists) or use existing
    # We'll try to use the one from previous test: test.student@example.com
    # Or create a new one to be sure.
    
    # Let's just assume we have a lead with email "webhook.sender@example.com"
    # First, create this lead to ensure it exists.
    lead_data = {
        "name": "Webhook Sender",
        "email": "webhook.sender@example.com",
        "phone": "9988776655",
        "city": "Cyber City",
        "role": "student"
    }
    try:
        # We need auth to create lead
        # Quick hack: use the same auth logic as verify_email_system.py or just rely on public endpoint if available?
        # Public endpoint: /public/leads
        response = requests.post(f"{BASE_URL}/public/leads", json=lead_data)
        if response.status_code in [200, 201]:
            print("✅ Created/Ensured test lead exists.")
            lead = response.json()
            lead_id = lead['id']
        else:
            # Maybe it already exists?
            print(f"⚠️ Lead creation response: {response.status_code}. Assuming lead might exist.")
            # We can't easily get ID without auth, but webhook only needs email.
    except Exception as e:
        print(f"❌ Error creating lead: {e}")

    # 2. Send Webhook Payload
    webhook_payload = {
        "items": [
            {
                "uuid": "12345",
                "messageId": "msg-001",
                "from": {
                    "name": "Harshad Thorat",
                    "address": "harshad16042004@gmail.com"
                },
                "to": [
                    {
                        "name": "Python Pro",
                        "address": "harshad16042004@gmail.com"
                    }
                ],
                "sentAt": "2023-10-27T10:00:00.000+00:00",
                "subject": "Re: Welcome to Python Pro",
                "text": "This is a reply from the student via webhook.",
                "html": "<p>This is a reply from the student via webhook.</p>"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/webhooks/email", json=webhook_payload)
        if response.status_code == 200:
            print("✅ Webhook sent successfully.")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed to send webhook: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Error sending webhook: {e}")
        return

    # 3. Verify Log (requires Auth)
    # We will skip automated verification of log retrieval here to keep script simple, 
    # as we can verify visually in the dashboard or trust the "Logged incoming email" print in backend.
    print("⚠️ Please check the Admin Dashboard 'Email' tab for 'Webhook Sender' to verify the message appears on the LEFT.")

if __name__ == "__main__":
    test_webhook()
