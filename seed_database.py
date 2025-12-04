"""
Script to seed the database with sample courses and batches
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

# Create courses
courses = [
    {
        "title": "Python for Beginners",
        "description": "Learn Python from scratch.",
        "price": 5000
    },
    {
        "title": "Advanced Python",
        "description": "Master advanced Python concepts.",
        "price": 7500
    },
    {
        "title": "Data Science with Python",
        "description": "Learn data analysis and visualization.",
        "price": 10000
    }
]

print("Creating courses...")
course_ids = []
for course in courses:
    response = requests.post(f"{BASE_URL}/courses", json=course, headers=headers)
    if response.status_code == 200:
        course_id = response.json()["id"]
        course_ids.append(course_id)
        print(f"✓ Created: {course['title']} (ID: {course_id})")
    else:
        print(f"✗ Failed to create: {course['title']}")

# Create batches with meeting links
batches = [
    {
        "course_id": course_ids[0], 
        "start_date": "2023-12-01", 
        "timings": "Mon-Wed-Fri 7PM",
        "meeting_link": "https://meet.google.com/abc-defg-hij"
    },
    {
        "course_id": course_ids[1], 
        "start_date": "2023-12-01", 
        "timings": "Tue-Thu 7PM",
        "meeting_link": "https://zoom.us/j/123456789"
    },
    {
        "course_id": course_ids[2], 
        "start_date": "2024-01-15", 
        "timings": "Sat-Sun 10AM",
        "meeting_link": "https://meet.google.com/xyz-abcd-efg"
    },
]

print("\nCreating batches...")
for i, batch in enumerate(batches):
    response = requests.post(f"{BASE_URL}/batches", json=batch, headers=headers)
    if response.status_code == 200:
        print(f"✓ Created batch for {courses[i]['title']}")
    else:
        print(f"✗ Failed to create batch: {response.text}")

print("\n✅ Database seeded successfully!")
