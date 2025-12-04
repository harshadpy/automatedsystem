from backend.database import create_db_and_tables
from backend.models import User, Lead, CommunicationLog, Course, Batch, Enrollment, Assignment, Submission, SupportTicket, Certificate

if __name__ == "__main__":
    print("Creating tables...")
    create_db_and_tables()
    print("Tables created successfully!")
