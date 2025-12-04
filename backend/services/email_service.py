import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = "harshad16042004@gmail.com" # Should ideally be from env or config
SENDER_NAME = "Python Pro"

def send_email(to_email: str, subject: str, content: str = None, html_content: str = None):
    """
    Send an email using Brevo API.
    """
    if not BREVO_API_KEY:
        print("BREVO_API_KEY not found. Skipping email.")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    if not html_content:
        if content:
            html_content = f"<p>{content}</p>"
        else:
            html_content = "<p>No content</p>"

    payload = {
        "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201, 202]:
            print(f"Brevo email sent successfully to {to_email}")
            return True
        else:
            print(f"Failed to send Brevo email to {to_email}: {response.text}")
            return False
    except Exception as e:
        print(f"Error sending Brevo email to {to_email}: {e}")
        return False

def send_welcome_email(lead_name: str, lead_email: str):
    """
    Sends the initial welcome email with payment links.
    """
    subject = "Welcome to Python Pro – Your Enrollment & Payment Details"
    html_content = f"""
    <p>Hi {lead_name},</p>
    <p>Thank you for your interest in the Python Mastery Program at Python Pro!</p>
    <p>We’ve received your details and reserved a spot for you in the upcoming batch.<br>
    Here are your important links:</p>
    
    <p><strong>Enroll Now:</strong><br>
    <a href="http://localhost:5173/pay/checkout?batch=1&student={lead_name}&email={lead_email}">Complete Enrollment & Payment</a></p>
    
    <p><strong>View Syllabus:</strong><br>
    <a href="https://pythonpro.in/syllabus">https://pythonpro.in/syllabus</a></p>
    
    <p><strong>Next Steps:</strong><br>
    Our team will contact you within 24 hours to confirm your batch timing, share fee details, and guide you through onboarding.</p>
    
    <p>If you have any questions, feel free to reply to this email anytime.</p>
    
    <p>Thank you again for choosing Python Pro.<br>
    We look forward to helping you build real programming skills.</p>
    
    <p>Regards,<br>
    Python Pro Team<br>
    support@pythonpro.in</p>
    """
    return send_email(lead_email, subject, html_content=html_content)

def send_credentials_email(name: str, email: str, password: str, course_name: str = "Python Mastery Program"):
    """
    Sends the login credentials to the new student.
    """
    subject = f"Welcome to {course_name} - Your Login Credentials"
    html_content = f"""
    <p>Hi {name},</p>
    <p>Welcome to the <strong>{course_name}</strong>! Your payment has been received successfully.</p>
    <p>We have created your student account. You can now access your learning dashboard to view your schedule, assignments, and materials.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Dashboard URL:</strong> <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Password:</strong> {password}</p>
    </div>
    
    <p>Please login and change your password immediately.</p>
    
    """
    return send_email(email, subject, html_content=html_content)

def send_manual_notification_email(name: str, email: str, subject: str, message: str):
    """
    Sends a manually triggered notification email with a professional template.
    """
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Python Pro Update</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; background-color: white;">
            <p>Hi {name},</p>
            
            <div style="line-height: 1.6; margin: 20px 0;">
                {message.replace(chr(10), '<br>')}
            </div>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Python Pro Team</strong>
            </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p>&copy; 2025 Python Pro Coaching. All rights reserved.</p>
            <p>You received this email because you are registered with us.</p>
        </div>
    </div>
    """
    return send_email(email, subject, html_content=html_content)

def send_enrollment_confirmation(name: str, email: str, course_name: str):
    """
    Sends a confirmation email to an existing student when they enroll in a new batch.
    """
    subject = f"Enrollment Confirmed: {course_name}"
    html_content = f"""
    <p>Hi {name},</p>
    <p>Congratulations! Your enrollment in <strong>{course_name}</strong> has been confirmed.</p>
    <p>Since you are already a registered student, you can simply login to your dashboard to access the new course materials.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Dashboard URL:</strong> <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
        <p><strong>Username:</strong> {email}</p>
    </div>
    
    <p>Happy Learning!</p>
    <p>Regards,<br>Python Pro Team</p>
    """
    return send_email(email, subject, html_content=html_content)
