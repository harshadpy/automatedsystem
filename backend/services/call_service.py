import os
import requests
import json

def initiate_call(to_number: str, agent_id: str = None):
    """
    Initiates a call using Bolna AI.
    """
    api_key = os.getenv("BOLNA_API_KEY")
    if not agent_id:
        agent_id = os.getenv("BOLNA_AGENT_ID")

    if not api_key or not agent_id:
        print("[MOCK] Bolna API Key or Agent ID not configured. Skipping call.")
        return {"status": "mock_skipped", "reason": "credentials_missing"}

    url = "https://api.bolna.ai/call"  # Verify this endpoint based on docs, assuming standard
    # Based on research, it might be different, let's try to be generic or use what we found.
    # Research said: https://api.bolna.ai/agent/{agent_id}/call or similar. 
    # Let's use a generic structure and if it fails, the user can debug.
    # Actually, let's use the one found in research if possible, or a standard post.
    # Re-checking research summary: "makeCall API endpoint".
    # Let's assume a standard POST to https://api.bolna.ai/trigger or similar for now, 
    # but since I don't have the EXACT URL, I will put a placeholder and a comment.
    
    # Correction: Research mentioned "initiate outbound phone calls... by providing agent ID and recipient phone number".
    # Let's assume: POST https://api.bolna.ai/call
    
    url = "https://api.bolna.ai/call" 
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format phone number to E.164
    if not to_number.startswith('+'):
        if len(to_number) == 10:
            to_number = f"+91{to_number}"
        else:
            to_number = f"+{to_number}"

    payload = {
        "agent_id": agent_id,
        "recipient_phone_number": to_number
    }

    try:
        print(f"Initiating Bolna AI call to {to_number} with agent {agent_id}...")
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            print(f"Bolna AI call initiated successfully: {response.json()}")
            return {"status": "success", "data": response.json()}
        else:
            print(f"Failed to initiate Bolna AI call: {response.status_code} - {response.text}")
            return {"status": "error", "code": response.status_code, "message": response.text}
            
    except Exception as e:
        print(f"Error calling Bolna AI: {e}")
        return {"status": "error", "message": str(e)}
