import sys
import os
from dotenv import load_dotenv

# Add current directory to path so we can import services
sys.path.append(os.getcwd())

load_dotenv(os.path.join(os.getcwd(), "..", ".env"))

from services import whatsapp_service

class MockLead:
    def __init__(self, name, phone):
        self.name = name
        self.phone = phone

def test_send():
    # Use the number from the user's curl request
    lead = MockLead("Test User", "9325642225")
    print(f"Testing AiSensy send to {lead.phone}...")
    
    response = whatsapp_service.send_enrollment_notification(lead)
    print("Response:", response)

if __name__ == "__main__":
    test_send()
