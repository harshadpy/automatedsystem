# Setting Up Inbound Email Support

Currently, your application is running on `localhost`, which means it is private to your computer. External services like Brevo (which sends the emails) cannot "see" your computer to notify it when a reply arrives.

To receive **real** email replies, you have two options:

## Option 1: Use ngrok (For Local Testing)
`ngrok` is a tool that creates a secure tunnel from the public internet to your local computer.

1.  **Download ngrok**: Go to [ngrok.com](https://ngrok.com/download) and download the version for Windows.
2.  **Install**: Unzip it and place `ngrok.exe` in a folder (e.g., your project folder).
3.  **Start Tunnel**: Open a terminal in that folder and run:
    ```powershell
    ./ngrok http 8000
    ```
    This will give you a URL like `https://a1b2-c3d4.ngrok-free.app`.
4.  **Configure Brevo**:
    - Go to your Brevo Dashboard -> Transactional -> Settings -> Webhooks.
    - Add a new webhook for "Inbound Email".
    - Set the URL to: `YOUR_NGROK_URL/webhooks/email` (e.g., `https://a1b2-c3d4.ngrok-free.app/webhooks/email`).
    - Select events: "Inbound Email" (or similar).

Now, when you reply to an email, Brevo will send the data to your ngrok URL, which forwards it to your local app!

## Option 2: Deploy to a Server (Production)
When you deploy your application to a real server (like Render, Railway, AWS, or DigitalOcean), you will have a permanent public domain (e.g., `https://my-python-coaching.com`).

1.  **Deploy** your backend.
2.  **Configure Brevo** webhook URL to: `https://your-domain.com/webhooks/email`.

## How to View Messages
Once setup is complete (or if you ran the simulation script):
1.  Go to the **Admin Dashboard**.
2.  Click the **Email** tab in the sidebar.
3.  Select the user **Harshad Thorat** (or whoever sent the reply).
4.  You will see the incoming message on the **left side** of the chat window.
