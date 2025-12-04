import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_certificates():
    # 1. Login as Admin
    print("1. Logging in as Admin...")
    response = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    if response.status_code != 200:
        print("Login failed")
        return
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("   [OK] Logged in as Admin")

    # 2. Get a Student and Course
    print("\n2. Getting Student and Course...")
    users_resp = requests.get(f"{BASE_URL}/users?role=student", headers=admin_headers)
    students = users_resp.json()
    if not students:
        print("   No students found. Please create one first.")
        return
    student = students[0]
    print(f"   Using Student: {student['name']} (ID: {student['id']})")
    
    courses_resp = requests.get(f"{BASE_URL}/courses", headers=admin_headers)
    courses = courses_resp.json()
    if not courses:
        print("   No courses found.")
        return
    course = courses[0]
    print(f"   Using Course: {course['title']} (ID: {course['id']})")

    # 3. Generate Certificate (Admin)
    print("\n3. Generating Certificate...")
    gen_resp = requests.post(f"{BASE_URL}/certificates/generate", json={
        "student_id": student['id'],
        "course_id": course['id']
    }, headers=admin_headers)
    
    # print(f"   Response: {gen_resp.text}")
    if gen_resp.status_code == 200:
        cert_data = gen_resp.json()
        print("   [OK] Certificate Generated")
    else:
        print(f"   [FAIL] SC: {gen_resp.status_code}")
        print(f"   [FAIL] Resp: {gen_resp.text[:200]}")
        return

    # 4. Login as Student
    print("\n4. Logging in as Student...")
    # We need the student's credentials. For this test, we might need to reset password or use a known one.
    # Since we can't easily know the student's password if it was randomly generated, 
    # let's create a specific test student for this purpose.
    
    test_student_email = "cert.test@example.com"
    test_student_pass = "password123"
    
    # Create test student if not exists
    create_resp = requests.post(f"{BASE_URL}/users", json={
        "name": "Cert Test Student",
        "email": test_student_email,
        "password": test_student_pass,
        "role": "student"
    })
    
    # Login
    login_resp = requests.post(f"{BASE_URL}/token", data={
        "username": test_student_email,
        "password": test_student_pass
    })
    
    if login_resp.status_code != 200:
        print("   [FAIL] Failed to login as test student (maybe creation failed or exists with diff pass)")
        # Fallback: Try to generate for the student we found in step 2, assuming we know the password or skip login check
        # But to test /certificates/me we need a token.
        # Let's just use the admin token to generate for THIS new student, then login as THIS student.
    else:
        student_token = login_resp.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        print("   [OK] Logged in as Test Student")
        
        # Get user ID
        me_resp = requests.get(f"{BASE_URL}/users/me", headers=student_headers)
        me = me_resp.json()
        
        # Generate cert for THIS student
        print("   Generating certificate for Test Student...")
        requests.post(f"{BASE_URL}/certificates/generate", json={
            "student_id": me['id'],
            "course_id": course['id']
        }, headers=admin_headers)
        
        # 5. Fetch Certificates (Student)
        print("\n5. Fetching Certificates (Student View)...")
        certs_resp = requests.get(f"{BASE_URL}/certificates/me", headers=student_headers)
        my_certs = certs_resp.json()
        print(f"   Found {len(my_certs)} certificates")
        
        if len(my_certs) > 0:
            cert = my_certs[0]
            print(f"   Certificate: {cert['course_name']} (ID: {cert['id']})")
            
            # 6. Download Certificate
            print("\n6. Downloading Certificate...")
            # The URL in the response is relative, e.g., /certificates/1/download
            download_url = f"{BASE_URL}{cert['url']}"
            file_resp = requests.get(download_url, headers=student_headers)
            
            if file_resp.status_code == 200:
                print("   [OK] Download successful")
                # Verify it's a PDF
                if file_resp.headers['content-type'] == 'application/pdf':
                    print("   [OK] Content-Type is application/pdf")
                else:
                    print(f"   [FAIL] Unexpected Content-Type: {file_resp.headers['content-type']}")
            else:
                print(f"   [FAIL] Download failed: {file_resp.status_code}")
        else:
            print("   [FAIL] No certificates found for student")

if __name__ == "__main__":
    test_certificates()
