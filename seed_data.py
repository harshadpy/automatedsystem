from sqlmodel import Session, select
from backend.database import engine
from backend.models import User, Course, Batch, Lead, Enrollment
from backend.auth import get_password_hash
from datetime import datetime

def seed_data():
    with Session(engine) as session:
        print("Seeding data...")

        # 1. Create Admin User
        admin_email = "admin@example.com"
        existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
        if not existing_admin:
            admin = User(
                name="Admin User",
                email=admin_email,
                role="admin",
                hashed_password=get_password_hash("admin123")
            )
            session.add(admin)
            print(f"✓ Created Admin: {admin_email}")
        else:
            print(f"⚠ Admin already exists: {admin_email}")

        # 2. Create Courses
        courses_data = [
            {"title": "Python for Beginners", "description": "Learn Python from scratch.", "price": 5000},
            {"title": "Advanced Python", "description": "Master advanced Python concepts.", "price": 7500},
            {"title": "Data Science with Python", "description": "Learn data analysis and visualization.", "price": 10000}
        ]
        
        created_courses = []
        for course_data in courses_data:
            existing_course = session.exec(select(Course).where(Course.title == course_data["title"])).first()
            if not existing_course:
                course = Course(**course_data)
                session.add(course)
                created_courses.append(course)
                print(f"✓ Created Course: {course.title}")
            else:
                created_courses.append(existing_course)
                print(f"⚠ Course already exists: {existing_course.title}")
        
        session.commit() # Commit to get IDs
        
        # Refresh courses to get IDs
        for course in created_courses:
            session.refresh(course)

        # 3. Create Batches
        if created_courses:
            batches_data = [
                {"course_id": created_courses[0].id, "start_date": "2023-12-01", "timings": "Mon-Wed-Fri 7PM", "meeting_link": "https://meet.google.com/abc-defg-hij"},
                {"course_id": created_courses[1].id, "start_date": "2023-12-01", "timings": "Tue-Thu 7PM", "meeting_link": "https://zoom.us/j/123456789"},
                {"course_id": created_courses[2].id, "start_date": "2024-01-15", "timings": "Sat-Sun 10AM", "meeting_link": "https://meet.google.com/xyz-abcd-efg"}
            ]

            for batch_data in batches_data:
                # Check if batch exists (simple check by course_id and start_date)
                existing_batch = session.exec(select(Batch).where(Batch.course_id == batch_data["course_id"]).where(Batch.start_date == batch_data["start_date"])).first()
                if not existing_batch:
                    batch = Batch(**batch_data)
                    session.add(batch)
                    print(f"✓ Created Batch for Course ID: {batch.course_id}")
                else:
                    print(f"⚠ Batch already exists for Course ID: {batch_data['course_id']}")

        # 4. Create Leads
        leads_data = [
            {"name": "John Doe", "email": "john@example.com", "phone": "1234567890", "city": "New York", "role": "student", "status": "new"},
            {"name": "Jane Smith", "email": "jane@example.com", "phone": "9876543210", "city": "London", "role": "parent", "status": "interested"},
            {"name": "Alice Johnson", "email": "alice@example.com", "phone": "5551234567", "city": "Paris", "role": "student", "status": "enrolled"}
        ]

        for lead_data in leads_data:
            existing_lead = session.exec(select(Lead).where(Lead.email == lead_data["email"])).first()
            if not existing_lead:
                lead = Lead(**lead_data)
                session.add(lead)
                print(f"✓ Created Lead: {lead.name}")
            else:
                print(f"⚠ Lead already exists: {lead_data['email']}")

        session.commit()
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
