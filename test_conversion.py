import requests
import sys
import time

BASE_URL = "http://localhost:8000"

def test_conversion_flow():
    print("Starting Lead Conversion Flow Test...")
    
    # 1. Create a public lead with course selection
    print("\n1. Creating Public Lead with Course Selection...")
    # Assuming Course ID 2 exists (Advanced Python)
    course_id = 2
    lead_data = {
        "name": "Class Selection Test User",
        "email": f"test_class_{int(time.time())}@example.com",
        "phone": "+919999999999",
        "city": "Test City",
        "role": "student",
        "course_id": course_id
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/public/leads", json=lead_data)
        if resp.status_code == 200:
            lead = resp.json()
            print(f"✓ Lead created: {lead['name']} ({lead['email']}) for Course ID: {lead.get('course_id')}")
        else:
            print(f"✗ Failed to create lead: {resp.text}")
            return
    except Exception as e:
        print(f"✗ Error creating lead: {e}")
        return

    # 2. Simulate Payment Webhook
    print("\n2. Simulating Payment Webhook...")
    webhook_data = {
        "status": "success",
        "order_id": f"ORDER_{int(time.time())}",
        "email": lead['email'],
        "name": lead['name'],
        "amount": 7500 # Price for Course 2
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/payments/webhook/mock", json=webhook_data)
        if resp.status_code == 200:
            print("✓ Webhook received successfully")
        else:
            print(f"✗ Webhook failed: {resp.text}")
            return
    except Exception as e:
        print(f"✗ Error sending webhook: {e}")
        return

    # 3. Verify User Creation and Enrollment
    print("\n3. Verifying User Creation and Enrollment...")
    # Login as admin to check users
    try:
        login_resp = requests.post(f"{BASE_URL}/token", data={
            "username": "admin@example.com",
            "password": "admin123"
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check users
        users_resp = requests.get(f"{BASE_URL}/users", headers=headers)
        users = users_resp.json()
        created_user = next((u for u in users if u['email'] == lead['email']), None)
        
        if created_user:
            print(f"✓ User account created for {lead['email']}")
            
            # Check enrollment
            # We expect batch_id 2 for course_id 2 based on seed_database.py
            expected_batch_id = 2
            enrollments_resp = requests.get(f"{BASE_URL}/enrollments", headers=headers)
            enrollments = enrollments_resp.json() if enrollments_resp.status_code == 200 else []
            
            # Filter enrollments for this user
            user_enrollment = next((e for e in enrollments if e['student_id'] == created_user['id']), None)
            
            if user_enrollment:
                if user_enrollment['batch_id'] == expected_batch_id:
                     print(f"✓ User enrolled in correct batch (ID: {user_enrollment['batch_id']})")
                else:
                     print(f"✗ User enrolled in WRONG batch (Expected: {expected_batch_id}, Actual: {user_enrollment['batch_id']})")
            else:
                print("? Could not verify enrollment details directly (endpoint might be missing)")

            # Verify Unique Password (should NOT be 'welcome123')
            print("   Verifying password uniqueness...")
            try:
                login_check = requests.post(f"{BASE_URL}/token", data={
                    "username": lead['email'],
                    "password": "welcome123"
                })
                if login_check.status_code == 401:
                    print("   ✓ Default password 'welcome123' rejected (Unique password generated)")
                else:
                    print("   ✗ Default password 'welcome123' WORKED (Password not unique)")
            except Exception as e:
                print(f"   ? Error checking password: {e}")

        else:
            print(f"✗ User account NOT found for {lead['email']}")
            
        # Check lead status
        leads_resp = requests.get(f"{BASE_URL}/leads", headers=headers)
        leads = leads_resp.json()
        updated_lead = next((l for l in leads if l['email'] == lead['email']), None)
        
        if updated_lead and updated_lead['status'] == 'enrolled':
            print(f"✓ Lead status updated to 'enrolled'")
        else:
            print(f"✗ Lead status NOT updated (Status: {updated_lead['status'] if updated_lead else 'Not Found'})")
            
    except Exception as e:
        print(f"✗ Error verifying data: {e}")

if __name__ == "__main__":
    test_conversion_flow()
