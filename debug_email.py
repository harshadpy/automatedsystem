import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.getcwd())

from backend.services import email_service

def debug_email():
    print("Debugging Email Service...")
    
    # Check API Key
    load_dotenv()
    api_key = os.getenv("BREVO_API_KEY")
    if not api_key:
        print("❌ BREVO_API_KEY is missing in .env")
    else:
        print(f"✅ BREVO_API_KEY found (starts with {api_key[:4]}...)")

    # Try sending
    print("\nAttempting to send test email...")
    try:
        success = email_service.send_manual_notification_email(
            name="Debug User",
            email="harshad16042004@gmail.com",
            subject="Debug Email",
            message="This is a debug email."
        )
        
        if success:
            print("✅ Email sent successfully!")
        else:
            print("❌ Email sending failed. Check console output above for details.")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_email()
