import requests
import json

BASE_URL = "http://localhost:8000"

def test_enrollment_management():
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

    # 2. Get a Batch (or create one)
    print("\n2. Getting Batches...")
    batches_resp = requests.get(f"{BASE_URL}/batches", headers=headers)
    batches = batches_resp.json()
    if not batches:
        print("   No batches found. Creating one...")
        # Create a batch logic here if needed, but assuming batches exist from previous steps
        return
    
    batch_id = batches[0]['id']
    print(f"   Using Batch ID: {batch_id}")

    # 3. Get Enrolled Students (Should be empty or have some from history)
    print(f"\n3. Fetching Enrolled Students for Batch {batch_id}...")
    students_resp = requests.get(f"{BASE_URL}/batches/{batch_id}/students", headers=headers)
    initial_students = students_resp.json()
    print(f"   Found {len(initial_students)} students initially.")
    
    # 4. Create and Enroll a New Student
    print("\n4. Creating and Enrolling New Student...")
    student_data = {
        "name": "Enrollment Test Student",
        "email": "enroll.test@example.com",
        "password": "password123",
        "role": "student"
    }
    # Create user
    user_resp = requests.post(f"{BASE_URL}/users", json=student_data)
    if user_resp.status_code == 200:
        user = user_resp.json()
    else:
        # Try to find existing
        users_resp = requests.get(f"{BASE_URL}/users", headers=headers)
        users = users_resp.json()
        user = next((u for u in users if u['email'] == student_data['email']), None)
        
    if not user:
        print("   Failed to create/find student")
        return
        
    print(f"   Student ID: {user['id']}")
    
    # Enroll
    enroll_resp = requests.post(f"{BASE_URL}/enrollments", json={
        "student_id": user['id'],
        "batch_id": batch_id,
        "payment_id": "TEST_MANUAL",
        "amount": 0,
        "status": "completed"
    }, headers=headers)
    
    if enroll_resp.status_code == 200 or "already enrolled" in enroll_resp.text:
        print("   ✓ Student Enrolled")
    else:
        print(f"   ✗ Enrollment Failed: {enroll_resp.text}")
        return

    # 5. Verify Student is in the List
    print(f"\n5. Verifying Student in Batch {batch_id} List...")
    students_resp = requests.get(f"{BASE_URL}/batches/{batch_id}/students", headers=headers)
    updated_students = students_resp.json()
    
    found = any(s['id'] == user['id'] for s in updated_students)
    if found:
        print("   ✓ Success! Student found in the enrolled list.")
    else:
        print("   ✗ Failure! Student NOT found in the enrolled list.")

if __name__ == "__main__":
    test_enrollment_management()
