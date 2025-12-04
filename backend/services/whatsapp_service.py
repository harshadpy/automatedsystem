import os
import requests
from dotenv import load_dotenv

load_dotenv()

AISENSY_API_KEY = os.getenv("AISENSY_API_KEY")
AISENSY_CAMPAIGN_NAME = os.getenv("AISENSY_CAMPAIGN_NAME", "training_meeting")
AISENSY_TEMPLATE_ENROLLMENT = os.getenv("AISENSY_TEMPLATE_ENROLLMENT", "python_enrollment")
AISENSY_TEMPLATE_MEETING = os.getenv("AISENSY_TEMPLATE_MEETING", "python_meeting")
USER_NAME = os.getenv("userName", "College 3374")

def send_template_message(to_number: str, template_name: str, params: list = None):
    """
    Sends a WhatsApp template message via AiSensy.
    """
    # Basic phone formatting
    # Remove non-digits
    clean_number = ''.join(filter(str.isdigit, to_number))
    
    if len(clean_number) == 10:
        to_number = "91" + clean_number
    elif len(clean_number) == 12 and clean_number.startswith("91"):
        to_number = clean_number
    # else leave it as is (might be international or already correct)
    
    if not AISENSY_API_KEY or "your_aisensy_api_key" in AISENSY_API_KEY:
        print(f"[MOCK] Sending WhatsApp to {to_number} | Template: {template_name} | Params: {params}")
        return {"status": "mock_sent", "note": "API Key not configured"}

    url = "https://backend.aisensy.com/campaign/t1/api/v2"
    
    # Note: AiSensy API uses 'campaignName' to identify the template/campaign to send.
    # We are using the environment variable AISENSY_CAMPAIGN_NAME as the default campaign,
    # but the user request implies we might need to switch campaigns or templates.
    # However, AiSensy V2 API typically uses 'campaignName' as the identifier.
    # If the user means 'template name' is different from 'campaign name', 
    # usually in AiSensy you create a campaign for each template.
    # So we will assume template_name passed here IS the campaign name in AiSensy terms.
    
    payload = {
        "apiKey": AISENSY_API_KEY,
        "campaignName": template_name, 
        "destination": to_number,
        "userName": USER_NAME,
        "templateParams": params or [],
        "source": "api-trigger",
        "media": {},
        "buttons": [],
        "carouselCards": [],
        "location": {},
        "attributes": {},
        "paramsFallbackValue": {
            "FirstName": "user"
        }
    }
    
    try:
        # Log the attempt
        with open("whatsapp_debug.log", "a") as f:
            f.write(f"Attempting to send to {to_number} with payload: {payload}\n")

        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        # Log the response
        with open("whatsapp_debug.log", "a") as f:
            f.write(f"Response Status: {response.status_code}\n")
            f.write(f"Response Body: {response.text}\n")
            f.write("-" * 50 + "\n")

        if response.status_code == 200:
             return response.json()
        else:
            print(f"AiSensy Error: {response.status_code} - {response.text}")
            return {"status": "error", "details": response.text}
            
    except Exception as e:
        with open("whatsapp_debug.log", "a") as f:
            f.write(f"Exception: {str(e)}\n")
        print(f"Error sending WhatsApp: {e}")
        return {"status": "error", "error": str(e)}

def send_enrollment_message(name: str, phone: str, batch_start: str, timing: str):
    """
    Sends the enrollment confirmation message.
    Template: python_enrollment
    Params: [student_name, batch_start, timing]
    """
    params = [name, batch_start, timing]
    return send_template_message(phone, AISENSY_TEMPLATE_ENROLLMENT, params)

def send_meeting_link_message(name: str, phone: str, join_link: str, date: str, time: str):
    """
    Sends the meeting link message.
    Template: python_meeting
    Params: [student_name, join_link, class_date, class_time]
    """
    params = [name, join_link, date, time]
    return send_template_message(phone, AISENSY_TEMPLATE_MEETING, params)

# Keep the old function for backward compatibility if needed, or update it to use the new generic one
def send_enrollment_notification(lead):
    """
    Sends the enrollment notification using the new configuration.
    Legacy support for main.py calls.
    """
    # Use 'training_meeting' since 'python_enrollment' is not created yet
    # This is a temporary fix to make the button work
    template_name = AISENSY_CAMPAIGN_NAME # "training_meeting"
    
    # training_meeting expects: [name, join_link, date, time]
    # We'll provide default values
    params = [
        lead.name, 
        "https://meet.google.com/abc-defg-hij", # Default link
        "Upcoming",        # Default date
        "10:00 AM"         # Default time
    ]
    
    return send_template_message(lead.phone, template_name, params)
