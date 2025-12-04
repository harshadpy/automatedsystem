import requests
import sys

BASE_URL = "http://localhost:8000"

def login(email, password):
    response = requests.post(f"{BASE_URL}/token", data={"username": email, "password": password})
    if response.status_code != 200:
        print(f"Login failed for {email}: {response.text}")
        return None
    return response.json()["access_token"]

def create_ticket(token, subject, message):
    headers = {"Authorization": f"Bearer {token}"}
    data = {"subject": subject, "message": message}
    response = requests.post(f"{BASE_URL}/support", json=data, headers=headers)
    if response.status_code != 200:
        print(f"Create ticket failed: {response.text}")
        return None
    return response.json()

def get_tickets(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/support", headers=headers)
    if response.status_code != 200:
        print(f"Get tickets failed: {response.text}")
        return None
    return response.json()

def create_user(name, email, password, role):
    data = {"name": name, "email": email, "password": password, "role": role}
    response = requests.post(f"{BASE_URL}/users", json=data)
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 400 and "already registered" in response.text:
        print(f"User {email} already exists.")
        return True
    else:
        print(f"Create user failed: {response.text}")
        return None

def run_test():
    print("Starting Support Ticket Verification...")

    # Setup Users
    print("\n0. Setting up Test Users...")
    create_user("Verify Student", "verify_student@example.com", "password123", "student")
    # Ensure admin exists (assuming admin@example.com is standard, but let's create verify_admin just in case)
    create_user("Verify Admin", "verify_admin@example.com", "password123", "admin")

    # 1. Login as Student
    print("\n1. Logging in as Student...")
    student_token = login("verify_student@example.com", "password123")
    if not student_token:
        print("Could not login as student.")
        return

    # 2. Create Ticket
    print("\n2. Creating Support Ticket...")
    ticket = create_ticket(student_token, "Verification Ticket", "This is a test ticket.")
    if ticket:
        print(f"Ticket created: ID={ticket['id']}, Subject={ticket['subject']}")
    else:
        return

    # 3. List Tickets as Student
    print("\n3. Listing Tickets as Student...")
    student_tickets = get_tickets(student_token)
    if student_tickets:
        print(f"Found {len(student_tickets)} tickets for student.")
        found = any(t['id'] == ticket['id'] for t in student_tickets)
        print(f"Created ticket found in list: {found}")
    
    # 4. Login as Admin
    print("\n4. Logging in as Admin...")
    admin_token = login("verify_admin@example.com", "password123")
    if not admin_token:
        print("Could not login as admin.")
        return

    # 5. List Tickets as Admin
    print("\n5. Listing Tickets as Admin...")
    admin_tickets = get_tickets(admin_token)
    if admin_tickets:
        print(f"Found {len(admin_tickets)} tickets for admin.")
        found = any(t['id'] == ticket['id'] for t in admin_tickets)
        print(f"Created ticket found in admin list: {found}")

    print("\nVerification Complete.")

if __name__ == "__main__":
    run_test()
