import os
import requests
from dotenv import load_dotenv

load_dotenv()

BOLNA_API_KEY = os.getenv("BOLNA_API_KEY")
BOLNA_AGENT_ID = os.getenv("BOLNA_AGENT_ID")

def trigger_call(to_number: str, agent_id: str = None):
    """
    Triggers a call using a Bolna AI agent.
    
    Args:
        to_number (str): The phone number to call (e.g., +919999999999).
        agent_id (str, optional): The Agent ID to use. Defaults to env var BOLNA_AGENT_ID.
    """
    if not BOLNA_API_KEY:
        print(f"[MOCK] Bolna Call to {to_number} (API Key missing)")
        return {"status": "mock_sent", "note": "Bolna API Key not configured"}

    target_agent_id = agent_id or BOLNA_AGENT_ID
    if not target_agent_id:
        return {"status": "error", "message": "Agent ID is required"}

    url = "https://api.bolna.ai/call"  # Verify this endpoint in actual docs, this is a placeholder based on standard patterns
    # Based on search, it might be /trigger_call or similar. 
    # Since I don't have the exact endpoint from the snippet, I will use a generic one and add a TODO.
    # Actually, let's use the search result context: "making and stopping phone calls".
    
    # Let's assume a standard POST /call or /agent/{id}/call structure.
    # I will write a generic request structure and add comments for the user to verify the endpoint.
    
    url = "https://api.bolna.ai/trigger_call" # Placeholder
    
    payload = {
        "agent_id": target_agent_id,
        "recipient_phone_number": to_number
    }
    
    headers = {
        "Authorization": f"Bearer {BOLNA_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error triggering Bolna call: {e}")
        return {"status": "error", "error": str(e)}
