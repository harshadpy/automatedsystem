import requests
import json

BASE_URL = "http://localhost:8000"

def verify_stats():
    # Login
    response = requests.post(f"{BASE_URL}/token", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    if response.status_code != 200:
        print("Login failed")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get Stats
    response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print("Stats Response:")
        print(json.dumps(stats, indent=2))
        
        # Basic checks
        if stats["total_revenue"] > 0:
            print("✓ Total Revenue is dynamic ( > 0)")
        else:
            print("✗ Total Revenue is 0 (might be wrong if we seeded data)")
            
        trend = stats["enrollment_trend"]
        students_in_trend = sum(day["students"] for day in trend)
        if students_in_trend > 0:
             print(f"✓ Enrollment Trend has data ({students_in_trend} students in last 7 days)")
        else:
             print("✗ Enrollment Trend is empty")
             
    else:
        print(f"Failed to get stats: {response.status_code}")

if __name__ == "__main__":
    verify_stats()
