from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, FileResponse
from contextlib import asynccontextmanager
from sqlmodel import Session, select, SQLModel
from typing import List, Optional
import csv
import codecs
import codecs
from datetime import datetime, timedelta
import uuid
import secrets
import os

from .database import create_db_and_tables, get_session
from .models import User, Lead, CommunicationLog, Course, Batch, Enrollment, Assignment, Submission, SupportTicket, Certificate
from .schemas import (Token, UserCreate, UserRead, LeadCreate, LeadRead, CourseCreate, CourseRead, 
                      BatchCreate, BatchRead, EnrollmentRead, AssignmentCreate, AssignmentRead,
                      SubmissionCreate, SubmissionRead, SupportTicketCreate, SupportTicketRead,
                      ChatRequest, ChatResponse, EmailRequest, CommunicationLogRead, BrevoWebhookPayload)
from . import crud, auth
# Services will be imported lazily to avoid circular dependency/initialization issues
# from .services import email_service, whatsapp_service, call_service, ai_service, payment_service, certificate_service
from .services import call_service, email_service, certificate_service, whatsapp_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("STARTUP: Initializing database...")
    try:
        create_db_and_tables()
        print("STARTUP: Database initialized successfully!")
    except Exception as e:
        print(f"STARTUP ERROR: Database initialization failed: {e}")
    yield

app = FastAPI(
    title="AI-Powered Python Coaching Center API",
    description="Backend API for the coaching center management system.",
    version="0.1.0",
    lifespan=lifespan
)

# Add validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc.errors()}")
    print(f"Request body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://automatedsystem.vercel.app",
        "https://automatedsystem.vercel.app/"
    ],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Python Coaching Center API"}

# Auth Endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = crud.get_user_by_email(session, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users", response_model=UserRead)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = crud.get_user_by_email(session, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(session=session, user=user)

@app.get("/users/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return current_user

# Public Lead Endpoint (no auth required for landing page)
@app.post("/public/leads", response_model=LeadRead)
def create_public_lead(lead: LeadCreate, session: Session = Depends(get_session)):
    db_lead = crud.create_lead(session=session, lead=lead)
    
    # Send Notifications
    send_whatsapp_notification(db_lead)
    # Use new email service
    email_service.send_welcome_email(db_lead.name, db_lead.email)
    
    # Initiate Bolna AI Call
    call_service.initiate_call(db_lead.phone)
    
    return db_lead

def send_whatsapp_notification(lead: Lead, content: str = None):
    try:
        from .services import whatsapp_service
        
        # Note: AiSensy requires template messages. 
        # We are currently using the 'PythonClass' campaign which takes the user's name.
        # Custom 'content' is not currently supported with this specific template.
        
        response = whatsapp_service.send_enrollment_notification(lead)
        
        if response and response.get("status") != "error":
            print(f"AiSensy WhatsApp sent to {lead.phone}")
            return True
        else:
            print(f"Failed to send AiSensy WhatsApp to {lead.phone}: {response}")
            return False
            
    except Exception as e:
        print(f"Failed to send AiSensy WhatsApp to {lead.phone}: {e}")
        return False

# Removed inline send_email_notification as it is now in services/email_service.py

# Lead Notification Endpoints
# IMPORTANT: Bulk endpoints must come BEFORE parameterized endpoints
class BulkNotifyRequest(SQLModel):
    lead_ids: List[int]
    subject: Optional[str] = None
    prompt: Optional[str] = None

@app.post("/leads/bulk/notify/whatsapp")
def bulk_notify_whatsapp(request: BulkNotifyRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    success_count = 0
    for lead_id in request.lead_ids:
        lead = session.get(Lead, lead_id)
        if lead:
            if send_whatsapp_notification(lead, content=request.prompt):
                success_count += 1
    return {"message": f"WhatsApp notifications sent to {success_count} leads"}

@app.post("/leads/bulk/notify/email")
def bulk_notify_email(request: BulkNotifyRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    print(f"Received bulk email request: lead_ids={request.lead_ids}, subject={request.subject}, prompt={request.prompt}")
    success_count = 0
    for lead_id in request.lead_ids:
        lead = session.get(Lead, lead_id)
        if lead:
            if email_service.send_email(lead.email, request.subject, content=request.prompt):
                success_count += 1
    return {"message": f"Email notifications sent to {success_count} leads"}

# Individual lead endpoints (must come AFTER bulk endpoints)
@app.post("/leads/{lead_id}/notify/whatsapp")
def notify_lead_whatsapp(lead_id: int, prompt: Optional[str] = None, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    success = send_whatsapp_notification(lead, content=prompt)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send WhatsApp notification")
    return {"message": "WhatsApp notification sent"}

class WhatsAppEnrollmentRequest(SQLModel):
    name: str
    phone: str
    batch_start: str
    timing: str

class WhatsAppMeetingRequest(SQLModel):
    name: str
    phone: str
    join_link: str
    date: str
    time: str

@app.post("/send-enrollment")
def send_enrollment_whatsapp(request: WhatsAppEnrollmentRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """
    Send enrollment confirmation via WhatsApp.
    """
    response = whatsapp_service.send_enrollment_message(
        name=request.name,
        phone=request.phone,
        batch_start=request.batch_start,
        timing=request.timing
    )
    
    if response.get("status") == "error":
        raise HTTPException(status_code=500, detail=response.get("details", "Failed to send WhatsApp"))
        
    return {"status": "success", "response": response}

@app.post("/send-meeting-link")
def send_meeting_link_whatsapp(request: WhatsAppMeetingRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """
    Send meeting link via WhatsApp.
    """
    response = whatsapp_service.send_meeting_link_message(
        name=request.name,
        phone=request.phone,
        join_link=request.join_link,
        date=request.date,
        time=request.time
    )
    
    if response.get("status") == "error":
        raise HTTPException(status_code=500, detail=response.get("details", "Failed to send WhatsApp"))
        
    return {"status": "success", "response": response}

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/leads/{lead_id}/notify/email")
def notify_lead_email(lead_id: int, subject: Optional[str] = None, prompt: Optional[str] = None, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    success = email_service.send_manual_notification_email(lead.name, lead.email, subject=subject, message=prompt)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send Email notification")
    return {"message": "Email notification sent"}
@app.post("/leads/{lead_id}/call")
def call_lead(lead_id: int, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Initiate an AI call to the lead."""
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    result = call_service.initiate_call(lead.phone)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@app.post("/leads", response_model=LeadRead)
def create_lead(lead: LeadCreate, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Create a new lead. Admin only."""
    db_lead = crud.create_lead(session=session, lead=lead)
    
    # Send Notifications
    send_whatsapp_notification(db_lead)
    email_service.send_welcome_email(db_lead.name, db_lead.email)
    
    # Initiate Bolna AI Call
    call_service.initiate_call(db_lead.phone)
    
    return db_lead

@app.get("/leads", response_model=List[LeadRead])
def get_leads(session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    """Get all leads. Admin only."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return session.exec(select(Lead)).all()

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Delete a lead by ID. Admin only."""
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    session.delete(lead)
    session.commit()
    return {"message": "Lead deleted successfully"}

# Admin Stats Endpoint
@app.get("/admin/stats")
def get_admin_stats(session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_admin)):
    from sqlalchemy import func
    
    # Basic Counts
    total_leads = session.exec(select(func.count(Lead.id))).one()
    total_students = session.exec(select(func.count(User.id)).where(User.role == "student")).one()
    total_batches = session.exec(select(func.count(Batch.id))).one()
    
    # Revenue (sum of completed enrollments)
    total_revenue = session.exec(select(func.sum(Enrollment.amount)).where(Enrollment.status == "completed")).one() or 0
    
    # Lead Distribution by Status
    leads_by_status = session.exec(select(Lead.status, func.count(Lead.id)).group_by(Lead.status)).all()
    lead_distribution = [{"name": status, "value": count} for status, count in leads_by_status]
    
    # Enrollment Trends (Last 7 Days)
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=6)
    
    enrollment_trend = []
    for i in range(7):
        date = start_date + timedelta(days=i)
        # Count enrollments for this date
        # Note: SQLite doesn't have great date functions, so we might need to filter in python if volume is low, 
        # or use func.date if available. Let's try to filter in python for simplicity and reliability across DBs for this scale.
        
        # Optimized: In a real app with many records, use SQL grouping. 
        # Here we fetch all completed enrollments once and process in python for the last 7 days to be safe with SQLite dates.
        # Actually, let's just query for the specific day range to be cleaner.
        
        next_date = date + timedelta(days=1)
        count = session.exec(select(func.count(Enrollment.id)).where(
            Enrollment.created_at >= datetime.combine(date, datetime.min.time()),
            Enrollment.created_at < datetime.combine(next_date, datetime.min.time()),
            Enrollment.status == "completed"
        )).one()
        
        enrollment_trend.append({
            "name": date.strftime("%a"), # Mon, Tue
            "students": count
        })

    return {
        "total_leads": total_leads,
        "total_students": total_students,
        "total_revenue": total_revenue,
        "active_batches": total_batches,
        "lead_distribution": lead_distribution,
        "enrollment_trend": enrollment_trend
    }

# Course Endpoints
@app.get("/courses", response_model=List[CourseRead])
def get_courses(session: Session = Depends(get_session)):
    """Get all courses. Public endpoint."""
    return session.exec(select(Course)).all()

@app.post("/courses", response_model=CourseRead)
def create_course(course: CourseCreate, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Create a new course. Admin only."""
    db_course = Course(**course.dict())
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course

# Batch Endpoints
@app.get("/batches", response_model=List[BatchRead])
def get_batches(session: Session = Depends(get_session)):
    """Get all batches. Public endpoint."""
    return session.exec(select(Batch)).all()

@app.post("/batches", response_model=BatchRead)
def create_batch(batch: BatchCreate, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Create a new batch. Admin only."""
    db_batch = Batch(**batch.dict())
    session.add(db_batch)
    session.commit()
    session.refresh(db_batch)
    return db_batch

# Admin Lead Import Endpoint
@app.post("/leads/import")
async def import_leads_csv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_admin: User = Depends(auth.get_current_admin)
):
    """
    Import leads from a CSV file. Admin only.
    Expected CSV columns: name, email, phone, city, role (optional)
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read and decode the CSV file
    contents = await file.read()
    csv_reader = csv.DictReader(codecs.iterdecode(contents.splitlines(), 'utf-8'))
    
    imported_count = 0
    errors = []
    
    for idx, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header row
        try:
            # Validate required fields
            name = row.get('name', '').strip()
            email = row.get('email', '').strip()
            phone = row.get('phone', '').strip()
            city = row.get('city', '').strip()
            role = row.get('role', 'student').strip()
            
            if not name:
                errors.append(f"Row {idx}: Missing name")
                continue
            if not email:
                errors.append(f"Row {idx}: Missing email")
                continue
            if not phone:
                errors.append(f"Row {idx}: Missing phone")
                continue
            if not city:
                errors.append(f"Row {idx}: Missing city")
                continue
            
            # Validate Phone
            clean_phone = phone.replace(" ", "").replace("-", "")
            if not ((clean_phone.isdigit() and len(clean_phone) == 10) or (clean_phone.startswith("+") and len(clean_phone) > 10)):
                 errors.append(f"Row {idx}: Invalid phone number {phone}. Must be 10 digits or E.164.")
                 continue
            
            # Check if lead already exists
            existing_lead = session.exec(
                select(Lead).where(Lead.email == email)
            ).first()
            
            if existing_lead:
                errors.append(f"Row {idx}: Email {email} already exists")
                continue
            
            # Create new lead
            new_lead = Lead(
                name=name,
                email=email,
                phone=phone,
                city=city,
                role=role,
                status="new"
            )
            session.add(new_lead)
            imported_count += 1
            
        except Exception as e:
            errors.append(f"Row {idx}: {str(e)}")
    
    # Commit all valid leads
    session.commit()
    
    return {
        "imported": imported_count,
        "errors": errors,
        "total_rows": imported_count + len(errors)
    }

@app.post("/payments/webhook/{provider}")
async def payment_webhook(provider: str, request: Request, session: Session = Depends(get_session)):
    # In a real app, verify signature here
    data = await request.json()
    print(f"Received webhook from {provider}: {data}")
    
    # Mock logic to extract order_id and status
    status = data.get("status")
    email = data.get("email")
    name = data.get("name")
    amount = data.get("amount")
    
    if status == "success" and email:
        # 1. Check if user exists
        user = session.exec(select(User).where(User.email == email)).first()
        
        generated_password = None
        if not user:
            # 2. Create user if not exists
            generated_password = secrets.token_urlsafe(8) # Generate unique password
            hashed_password = auth.get_password_hash(generated_password)
            user = User(
                name=name or "Student",
                email=email,
                role="student",
                hashed_password=hashed_password
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"Created new user for {email}")
            
        # 3. Enroll in Batch
        # Get lead to find course_id
        lead = session.exec(select(Lead).where(Lead.email == email)).first()
        course_id = lead.course_id if lead and lead.course_id else 1 # Default to 1 if not found
        
        # Find active batch for this course
        # For now, just pick the first batch for the course or default to 1
        batch = session.exec(select(Batch).where(Batch.course_id == course_id)).first()
        batch_id = batch.id if batch else 1
        
        # Get Course Name for email
        course = session.get(Course, course_id)
        course_name = course.title if course else "Python Mastery Program"

        # Check if already enrolled
        existing_enrollment = session.exec(select(Enrollment).where(
            Enrollment.student_id == user.id,
            Enrollment.batch_id == batch_id
        )).first()
        
        if not existing_enrollment:
            enrollment = Enrollment(
                student_id=user.id,
                batch_id=batch_id,
                payment_id=f"MOCK_{provider.upper()}",
                amount=amount if amount else 4999,
                status="completed"
            )
            session.add(enrollment)
            session.commit()
            print(f"Enrolled {email} in batch {batch_id} for course {course_name}")
            
        # 4. Update Lead Status if exists
        if lead:
            lead.status = "enrolled"
            session.add(lead)
            session.commit()
            
        # 5. Send Credentials Email only if new user created
        if generated_password:
            email_service.send_credentials_email(user.name, user.email, generated_password, course_name)
        else:
            # Send confirmation to existing user
            email_service.send_enrollment_confirmation(user.name, user.email, course_name)
            
    return {"status": "received"}


# User Management Endpoints
@app.get("/users", response_model=List[UserRead])
def get_users(role: Optional[str] = None, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Get all users. Admin only."""
    if role:
        return session.exec(select(User).where(User.role == role)).all()
    return session.exec(select(User)).all()

# Enrollment Endpoints
@app.post("/enrollments", response_model=EnrollmentRead)
def create_enrollment(enrollment: Enrollment, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Enroll a student in a batch. Admin only."""
    # Check if already enrolled
    existing = session.exec(select(Enrollment).where(
        Enrollment.student_id == enrollment.student_id,
        Enrollment.batch_id == enrollment.batch_id
    )).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this batch")
        
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment

class LeadEnrollmentRequest(SQLModel):
    lead_id: int
    batch_id: int

@app.get("/batches/{batch_id}/students", response_model=List[UserRead])
def get_batch_students(batch_id: int, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Get all students enrolled in a specific batch."""
    enrollments = session.exec(select(Enrollment).where(Enrollment.batch_id == batch_id)).all()
    student_ids = [e.student_id for e in enrollments]
    
    if not student_ids:
        return []
        
    students = session.exec(select(User).where(User.id.in_(student_ids))).all()
    return students

@app.post("/enrollments/from-lead")
def enroll_lead(request: LeadEnrollmentRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Enroll a lead into a batch, converting to student if needed."""
    lead = session.get(Lead, request.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    # Check if user already exists
    user = session.exec(select(User).where(User.email == lead.email)).first()
    
    generated_password = None
    if not user:
        # Create new user
        generated_password = secrets.token_urlsafe(8)
        hashed_password = auth.get_password_hash(generated_password)
        user = User(
            name=lead.name,
            email=lead.email,
            role="student",
            hashed_password=hashed_password
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
    # Check if already enrolled
    existing = session.exec(select(Enrollment).where(
        Enrollment.student_id == user.id,
        Enrollment.batch_id == request.batch_id
    )).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this batch")
        
    # Create enrollment
    enrollment = Enrollment(
        student_id=user.id,
        batch_id=request.batch_id,
        payment_id="ADMIN_LEAD_CONVERSION",
        amount=0,
        status="completed"
    )
    session.add(enrollment)
    
    # Update lead status
    lead.status = "enrolled"
    session.add(lead)
    
    session.commit()
    
    # Send Credentials Email if new user
    # Send Credentials Email if new user
    batch = session.get(Batch, request.batch_id)
    course = session.get(Course, batch.course_id) if batch else None
    course_name = course.title if course else "Python Mastery Program"

    if generated_password:
        email_service.send_credentials_email(user.name, user.email, generated_password, course_name)
        return {"message": "Lead enrolled and credentials sent successfully", "student_id": user.id}
    else:
        email_service.send_enrollment_confirmation(user.name, user.email, course_name)
        return {"message": "Lead enrolled and confirmation email sent successfully", "student_id": user.id}

@app.get("/users/me/classes")
def get_my_classes(session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    """Get classes for the current user."""
    if current_user.role != "student":
        return []
        
    enrollments = session.exec(select(Enrollment).where(Enrollment.student_id == current_user.id)).all()
    classes = []
    
    for enrollment in enrollments:
        batch = session.get(Batch, enrollment.batch_id)
        if batch:
            course = session.get(Course, batch.course_id)
            classes.append({
                "title": course.title if course else "Unknown Course",
                "time": f"{batch.start_date} | {batch.timings}",
                "instructor": "AI Coach", # Placeholder
                "link": batch.meeting_link,
                "status": "upcoming" # Default status to prevent frontend crash
            })
            
    return classes
@app.get("/mock-payment")
def mock_payment_page(order_id: str, amount: float):
    return {"message": f"Mock Payment Page for Order {order_id} of Amount {amount}. Send a POST to /payments/webhook/phonepe with {{'order_id': '{order_id}', 'status': 'success'}} to simulate success."}
# Assignment Endpoints
@app.post("/assignments", response_model=AssignmentRead)
def create_assignment(assignment: AssignmentCreate, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    db_assignment = Assignment(**assignment.dict())
    session.add(db_assignment)
    session.commit()
    session.refresh(db_assignment)
    return db_assignment

@app.get("/assignments", response_model=List[AssignmentRead])
def read_assignments(batch_id: Optional[int] = None, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    if batch_id:
        return session.exec(select(Assignment).where(Assignment.batch_id == batch_id)).all()
    return session.exec(select(Assignment)).all()

# Submission Endpoints
@app.post("/submissions", response_model=SubmissionRead)
def create_submission(submission: SubmissionCreate, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    db_submission = Submission(
        assignment_id=submission.assignment_id,
        student_id=current_user.id,
        content=submission.content,
        file_url=submission.file_url
    )
    session.add(db_submission)
    session.commit()
    session.refresh(db_submission)
    return db_submission

@app.get("/submissions", response_model=List[SubmissionRead])
def read_submissions(assignment_id: Optional[int] = None, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    if assignment_id:
        return session.exec(select(Submission).where(Submission.assignment_id == assignment_id)).all()
    if current_user.role == "student":
        return session.exec(select(Submission).where(Submission.student_id == current_user.id)).all()
    return session.exec(select(Submission)).all()

@app.put("/submissions/{submission_id}/grade")
def grade_submission(submission_id: int, feedback: str, grade: str, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.feedback = feedback
    submission.grade = grade
    submission.status = "graded"
    session.add(submission)
    session.commit()
    return {"message": "Submission graded successfully"}

# Certificate Endpoints
class CertificateGenerateRequest(SQLModel):
    student_id: int
    course_id: int

@app.post("/certificates/generate")
def generate_certificate(request: CertificateGenerateRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Generate a certificate for a student."""
    student = session.get(User, request.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    course = session.get(Course, request.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Check if already exists
    existing = session.exec(select(Certificate).where(
        Certificate.student_id == request.student_id,
        Certificate.course_id == request.course_id
    )).first()
    
    if existing:
        return {"message": "Certificate already exists", "certificate_id": existing.id}
        
    try:
        # Generate PDF
        completion_date = datetime.now().strftime("%B %d, %Y")
        pdf_path = certificate_service.generate_certificate(student.name, course.title, completion_date)
        
        # Save to DB
        certificate = Certificate(
            student_id=student.id,
            course_id=course.id,
            certificate_url=pdf_path
        )
        session.add(certificate)
        session.commit()
        session.refresh(certificate)
        
        return {"message": "Certificate generated successfully", "certificate_id": certificate.id}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")

@app.get("/certificates/me")
def get_my_certificates(session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    """Get certificates for the current user."""
    certificates = session.exec(select(Certificate).where(Certificate.student_id == current_user.id)).all()
    
    results = []
    for cert in certificates:
        course = session.get(Course, cert.course_id)
        results.append({
            "id": cert.id,
            "course_name": course.title if course else "Unknown Course",
            "issue_date": cert.issue_date,
            "url": f"/certificates/{cert.id}/download"
        })
    return results

@app.get("/certificates/{certificate_id}/download")
def download_certificate(certificate_id: int, session: Session = Depends(get_session)):
    """Download a certificate PDF."""
    certificate = session.get(Certificate, certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if not os.path.exists(certificate.certificate_url):
        raise HTTPException(status_code=404, detail="Certificate file not found")
        
    return FileResponse(certificate.certificate_url, media_type="application/pdf", filename=os.path.basename(certificate.certificate_url))

# Support Ticket Endpoints
# Support Ticket Endpoints
@app.post("/support", response_model=SupportTicketRead)
def create_support_ticket(ticket: SupportTicketCreate, session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    db_ticket = SupportTicket(
        user_id=current_user.id,
        subject=ticket.subject,
        message=ticket.message,
        status="open"
    )
    session.add(db_ticket)
    session.commit()
    session.refresh(db_ticket)
    return db_ticket

@app.get("/support", response_model=List[SupportTicketRead])
def get_support_tickets(session: Session = Depends(get_session), current_user: User = Depends(auth.get_current_user)):
    if current_user.role == "admin":
        return session.exec(select(SupportTicket)).all()
    return session.exec(select(SupportTicket).where(SupportTicket.user_id == current_user.id)).all()

# AI Chat Endpoint
@app.post("/ai/chat", response_model=ChatResponse)
def ai_chat(chat_request: ChatRequest, current_user: User = Depends(auth.get_current_user)):
    """AI chatbot endpoint for students and admins."""
    from .services import ai_service
    
    response_text = ai_service.generate_content(chat_request.prompt)
    return ChatResponse(response=response_text)

# Communication Endpoints
@app.post("/communications/email")
def send_email_communication(request: EmailRequest, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Send an email to a lead/student and log it."""
    
    lead_id = request.lead_id
    email = request.email
    
    if not lead_id and not email:
        raise HTTPException(status_code=400, detail="Either lead_id or email must be provided")
        
    lead = None
    if lead_id:
        lead = session.get(Lead, lead_id)
        if not lead:
            # Try finding user if lead not found (since students are users)
            # But for now, let's assume lead_id maps to Lead table. 
            # If we want to email students, we should probably look up User table too or ensure they have a Lead record.
            # Given the system flow, students start as leads. So Lead record should exist?
            # Actually, once converted, they are Users. Lead record might still exist but status is enrolled.
            pass
            
    if not email and lead:
        email = lead.email
        
    if not email:
        raise HTTPException(status_code=400, detail="Email address not found")
        
    # Send Email
    success = email_service.send_manual_notification_email(
        name=lead.name if lead else "User",
        email=email,
        subject=request.subject,
        message=request.message
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
        
    # Log Communication
    if lead:
        log = CommunicationLog(
            lead_id=lead.id,
            type="email",
            status="sent",
            content=f"Subject: {request.subject}\n\n{request.message}"
        )
        session.add(log)
        session.commit()
        
    return {"message": "Email sent successfully"}

@app.get("/communications/{lead_id}", response_model=List[CommunicationLogRead])
def get_communication_history(lead_id: int, session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Get communication history for a lead."""
    return session.exec(select(CommunicationLog).where(CommunicationLog.lead_id == lead_id).order_by(CommunicationLog.timestamp.desc())).all()

@app.post("/webhooks/email")
async def email_webhook(payload: BrevoWebhookPayload, session: Session = Depends(get_session)):
    """Handle incoming email webhooks from Brevo."""
    print(f"Received webhook payload: {payload}")
    
    for item in payload.items:
        sender_email = item.sender.get("address")
        if not sender_email:
            continue
            
        # Find lead by email
        lead = session.exec(select(Lead).where(Lead.email == sender_email)).first()
        if not lead:
            print(f"Received email from unknown sender: {sender_email}")
            continue
            
        # Create log
        content = f"Subject: {item.subject}\n\n{item.text or 'No content'}"
        log = CommunicationLog(
            lead_id=lead.id,
            type="email",
            status="received",
            content=content
        )
        session.add(log)
        session.commit()
        print(f"Logged incoming email from {sender_email}")
        
    return {"message": "Webhook processed"}

@app.post("/leads/upload")
def upload_leads_csv(file: UploadFile = File(...), session: Session = Depends(get_session), current_admin: User = Depends(auth.get_current_admin)):
    """Upload leads via CSV."""
    import csv
    import io
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    content = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(content))
    
    leads_created = 0
    errors = []
    
    for row in csv_reader:
        try:
            # Basic validation and mapping
            lead_data = LeadCreate(
                name=row.get("name"),
                email=row.get("email"),
                phone=row.get("phone"),
                city=row.get("city", "Unknown"),
                role="student"
            )
            
            # Check if email exists
            existing_lead = session.exec(select(Lead).where(Lead.email == lead_data.email)).first()
            if existing_lead:
                continue
                
            crud.create_lead(session=session, lead=lead_data)
            leads_created += 1
            
        except Exception as e:
            errors.append(f"Row {csv_reader.line_num}: {str(e)}")
            
    return {"message": f"{leads_created} leads created successfully", "errors": errors}
