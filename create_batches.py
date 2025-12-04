"""
Simple script to create batches with meeting links
"""
import requests

BASE_URL = "http://localhost:8000"

# Login as admin
response = requests.post(
    f"{BASE_URL}/token",
    data={"username": "admin@example.com", "password": "admin123"}
)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get existing courses
response = requests.get(f"{BASE_URL}/courses", headers=headers)
courses = response.json()
print(f"Found {len(courses)} courses")

if len(courses) >= 3:
    # Create batches with meeting links
    batches = [
        {
            "course_id": courses[0]["id"], 
            "start_date": "2024-12-01", 
            "timings": "Mon-Wed-Fri 7PM",
            "meeting_link": "https://meet.google.com/abc-defg-hij"
        },
        {
            "course_id": courses[1]["id"], 
            "start_date": "2024-12-01", 
            "timings": "Tue-Thu 7PM",
            "meeting_link": "https://zoom.us/j/123456789"
        },
        {
            "course_id": courses[2]["id"], 
            "start_date": "2024-01-15", 
            "timings": "Sat-Sun 10AM",
            "meeting_link": "https://meet.google.com/xyz-abcd-efg"
        },
    ]

    print("\nCreating batches...")
    for i, batch in enumerate(batches):
        print(f"Batch data: {batch}")
        response = requests.post(f"{BASE_URL}/batches", json=batch, headers=headers)
        if response.status_code == 200:
            print(f"✓ Created batch for {courses[i]['title']}")
        else:
            print(f"✗ Failed: {response.status_code} - {response.text}")

    print("\n✅ Done!")
else:
    print("Not enough courses found!")
