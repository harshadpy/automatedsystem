"""
Add sample leads to the database
"""
import requests

BASE_URL = "http://localhost:8000"

# Sample leads data - using public endpoint (no auth needed)
sample_leads = [
    {"name": "Rahul Sharma", "email": "rahul.sharma@example.com", "phone": "9876543210", "city": "Mumbai", "role": "student"},
    {"name": "Priya Patel", "email": "priya.patel@example.com", "phone": "9876543211", "city": "Delhi", "role": "student"},
    {"name": "Amit Kumar", "email": "amit.kumar@example.com", "phone": "9876543212", "city": "Bangalore", "role": "student"},
    {"name": "Sneha Reddy", "email": "sneha.reddy@example.com", "phone": "9876543213", "city": "Hyderabad", "role": "parent"},
    {"name": "Vikram Singh", "email": "vikram.singh@example.com", "phone": "9876543214", "city": "Chennai", "role": "student"},
    {"name": "Anjali Gupta", "email": "anjali.gupta@example.com", "phone": "9876543215", "city": "Pune", "role": "student"},
    {"name": "Rajesh Verma", "email": "rajesh.verma@example.com", "phone": "9876543216", "city": "Kolkata", "role": "parent"},
    {"name": "Kavya Nair", "email": "kavya.nair@example.com", "phone": "9876543217", "city": "Kochi", "role": "student"},
    {"name": "Arjun Mehta", "email": "arjun.mehta@example.com", "phone": "9876543218", "city": "Ahmedabad", "role": "student"},
    {"name": "Divya Iyer", "email": "divya.iyer@example.com", "phone": "9876543219", "city": "Coimbatore", "role": "parent"},
]

print("Adding sample leads...\n")

success_count = 0
for lead in sample_leads:
    try:
        response = requests.post(f"{BASE_URL}/public/leads", json=lead)
        if response.status_code == 200:
            print(f"✓ Added: {lead['name']} ({lead['city']})")
            success_count += 1
        else:
            print(f"✗ Failed: {lead['name']} - {response.status_code}: {response.text}")
    except Exception as e:
        print(f"✗ Error: {lead['name']} - {str(e)}")

print(f"\n✅ Added {success_count}/{len(sample_leads)} leads successfully!")
if success_count > 0:
    print("Refresh your browser to see them in the Leads section.")
