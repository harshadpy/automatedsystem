from sqlmodel import Session, select
from backend.database import engine, create_db_and_tables
from backend.models import User, Enrollment, Batch, Course
from backend.auth import get_password_hash
from datetime import datetime, timedelta
import random

def seed_history():
    with Session(engine) as session:
        # Ensure we have some batches
        batches = session.exec(select(Batch)).all()
        if not batches:
            print("No batches found. Please run setup.py and create_batches.py first.")
            return

        print("Seeding historical data...")
        
        # Create some students
        students = []
        for i in range(10):
            email = f"student{i}@history.com"
            user = session.exec(select(User).where(User.email == email)).first()
            if not user:
                user = User(
                    name=f"History Student {i}",
                    email=email,
                    hashed_password=get_password_hash("password123"),
                    role="student"
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            students.append(user)
            
        # Create enrollments over the last 7 days
        today = datetime.utcnow().date()
        
        for i, student in enumerate(students):
            # Random date in last 7 days
            days_ago = random.randint(0, 6)
            enrollment_date = datetime.utcnow() - timedelta(days=days_ago)
            
            # Random batch
            batch = random.choice(batches)
            
            # Check if already enrolled
            existing = session.exec(select(Enrollment).where(
                Enrollment.student_id == student.id,
                Enrollment.batch_id == batch.id
            )).first()
            
            if not existing:
                enrollment = Enrollment(
                    student_id=student.id,
                    batch_id=batch.id,
                    payment_id=f"HIST_{i}",
                    amount=5000.0, # Mock amount
                    status="completed",
                    created_at=enrollment_date
                )
                session.add(enrollment)
                print(f"Enrolled {student.name} on {enrollment_date.strftime('%Y-%m-%d')}")

        session.commit()
        print("✅ Historical data seeded successfully!")

if __name__ == "__main__":
    seed_history()
