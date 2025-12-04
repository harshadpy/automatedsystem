# Bolna AI and AiSensy Setup Guide

This guide explains how to configure the newly added services for Voice (Bolna AI) and WhatsApp (AiSensy).

## 1. AiSensy (WhatsApp) Setup

AiSensy allows you to send WhatsApp notifications via their API.

### Prerequisites
1.  **Create an Account**: Sign up at [AiSensy](https://aisensy.com/).
2.  **Get API Key**: Go to your AiSensy Dashboard -> Manage -> API Key.
3.  **Create a Campaign**:
    *   Go to "Campaigns" -> "API Campaigns".
    *   Create a new campaign.
    *   Choose a Template (you must have approved templates).
    *   **Important**: The `campaignName` you set here must match the `campaign_name` you pass to the `send_whatsapp_template` function.

### Configuration
Add your API key to your `.env` file:
```env
AISENSY_API_KEY=your_actual_api_key_here
```

### Usage
```python
from backend.services.whatsapp_service import send_whatsapp_template

# Send a template message
# params correspond to variables in your template (e.g. {{1}}, {{2}})
send_whatsapp_template(
    to_number="9999999999", 
    campaign_name="welcome_message", 
    params=["John Doe", "Course A"]
)
```

## 2. Bolna AI (Voice) Setup

Bolna AI allows you to trigger AI voice agents to make calls.

### Prerequisites
1.  **Create an Account**: Sign up at [Bolna AI](https://bolna.ai/).
2.  **Get API Key**: Navigate to the Developer/API section to generate an API Key.
3.  **Create an Agent**: Create and configure a voice agent in the Bolna dashboard. Note down its `Agent ID`.

### Configuration
Add your credentials to your `.env` file:
```env
BOLNA_API_KEY=your_bolna_api_key
BOLNA_AGENT_ID=your_agent_id
```

### Usage
```python
from backend.services.voice_service import trigger_call

trigger_call(to_number="+919999999999")
```

## 3. Dependencies

Ensure you have the required packages installed:
```bash
pip install requests python-dotenv
```
(These are already in your `requirements.txt` or standard environment).
