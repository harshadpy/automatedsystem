import requests
import os

from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("BREVO_API_KEY")

url = "https://api.brevo.com/v3/smtp/email"
headers = {
    "accept": "application/json",
    "api-key": API_KEY,
    "content-type": "application/json"
}

payload = {
    "sender": {"name": "Python Pro", "email": "harshad16042004@gmail.com"},
    "to": [{"email": "harshad.thorat@vit.edu.in", "name": "Harshad"}],
    "subject": "Debug Test: Welcome to Python Pro",
    "htmlContent": "<p>This is a debug email to verify Brevo integration with new sender.</p>"
}

print(f"Sending to {url}...")
try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
