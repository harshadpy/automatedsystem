import requests
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def test_payments():
    # 1. Login
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

    # 2. Create Course
    print("Creating Course...")
    resp = requests.post(f"{BASE_URL}/courses", json={
        "title": "Python for Beginners",
        "description": "Learn Python from scratch.",
        "price": 4999.0
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create course: {resp.text}")
        sys.exit(1)
    course_id = resp.json()["id"]
    print(f"Course created: {course_id}")

    # 3. Create Batch
    print("Creating Batch...")
    resp = requests.post(f"{BASE_URL}/batches", json={
        "course_id": course_id,
        "start_date": "2023-12-01",
        "timings": "Mon-Wed-Fri 7PM"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create batch: {resp.text}")
        sys.exit(1)
    batch_id = resp.json()["id"]
    print(f"Batch created: {batch_id}")

    # 4. Create Student User (Simulating a user signing up)
    print("Creating Student User...")
    # Use a unique email
    email = f"student_{int(time.time())}@test.com"
    resp = requests.post(f"{BASE_URL}/users", json={
        "name": "Student One",
        "email": email,
        "password": "password123",
        "role": "student"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create student: {resp.text}")
        sys.exit(1)
    student_id = resp.json()["id"]
    print(f"Student created: {student_id}")

    # 5. Create Payment Link
    print("Creating Payment Link...")
    resp = requests.post(f"{BASE_URL}/payments/create", params={
        "student_id": student_id,
        "batch_id": batch_id,
        "provider": "phonepe"
    }, headers=headers)
    if resp.status_code != 200:
        print(f"Failed to create payment link: {resp.text}")
        sys.exit(1)
    payment_data = resp.json()
    order_id = payment_data["order_id"]
    print(f"Payment Link Created. Order ID: {order_id}")
    print(f"Link: {payment_data['payment_link']}")

    # 6. Simulate Webhook
    print("Simulating Webhook...")
    webhook_payload = {
        "order_id": order_id,
        "status": "success"
    }
    resp = requests.post(f"{BASE_URL}/payments/webhook/phonepe", json=webhook_payload, headers=headers)
    if resp.status_code != 200:
        print(f"Webhook failed: {resp.text}")
        sys.exit(1)
    print("Webhook received.")

    print("\nPAYMENT TESTS PASSED!")

if __name__ == "__main__":
    test_payments()
