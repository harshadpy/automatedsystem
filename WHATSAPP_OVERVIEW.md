# WhatsApp Service Documentation

This document outlines how the WhatsApp notification service is implemented and used in the **AI-Powered Python Coaching Center** project.

## Overview

The project uses **AiSensy** as the WhatsApp Business API provider to send automated notifications to new leads.

### Key Components

1.  **Service Logic**: `backend/services/whatsapp_service.py`
2.  **Integration**: `backend/main.py`
3.  **Configuration**: `.env`

## Implementation Details

### 1. The Service (`whatsapp_service.py`)

The core logic is encapsulated in the `whatsapp_service.py` file. It handles the HTTP communication with AiSensy's API.

-   **`send_whatsapp_template`**: This is the main function that constructs the payload and sends the POST request to `https://backend.aisensy.com/campaign/t1/api/v2`.
-   **`send_enrollment_notification`**: A helper function specifically designed for new lead enrollments. It uses the **"PythonClass"** campaign and formats the parameters (Lead Name) required by the template.

### 2. Integration Flow

The service is triggered automatically when a new lead is created.

1.  **Lead Creation**:
    -   **Public**: A user submits the form on the landing page (`POST /public/leads`).
    -   **Admin**: An admin manually adds a lead via the dashboard (`POST /leads`).
2.  **Trigger**: Both endpoints call `send_whatsapp_notification` in `main.py`.
3.  **Execution**: `main.py` imports `whatsapp_service` and calls `send_enrollment_notification(lead)`.
4.  **API Call**: The service sends the request to AiSensy.

### 3. Configuration

The service relies on the following environment variables in your `.env` file:

```properties
AISENSY_API_KEY=your_api_key_here
campaignName=PythonClass
userName=College 3374
```

## Payload Structure

The service sends a JSON payload to AiSensy in the following format:

```json
{
  "apiKey": "...",
  "campaignName": "PythonClass",
  "destination": "919876543210",
  "userName": "College 3374",
  "templateParams": [
    "John Doe",
    "John Doe",
    "John Doe"
  ],
  "source": "new-landing-page form",
  "media": {},
  "buttons": [],
  "carouselCards": [],
  "location": {},
  "attributes": {},
  "paramsFallbackValue": {
    "FirstName": "user"
  }
}
```

## Troubleshooting

### Logs
The service logs all attempts and responses to **`backend/whatsapp_debug.log`**. Check this file to see:
-   The exact payload being sent.
-   The response status code and body from AiSensy.
-   Any Python exceptions that occurred.

### Common Issues
-   **Invalid Phone Number**: The service automatically adds "91" to 10-digit numbers. Ensure the number is valid.
-   **API Key**: Verify the `AISENSY_API_KEY` in `.env` is correct.
-   **Campaign Name**: Ensure the `campaignName` matches exactly what is configured in your AiSensy dashboard.a
