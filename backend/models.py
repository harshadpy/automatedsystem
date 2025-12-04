from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True)
    role: str  # "admin", "student", "parent"
    hashed_password: str

class Lead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: str
    city: str
    role: str # "student", "parent"
    status: str = Field(default="new") # "new", "contacted", "interested", "enrolled"
    course_id: Optional[int] = Field(default=None, foreign_key="course.id")

class CommunicationLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lead_id: int = Field(foreign_key="lead.id")
    type: str # "email", "whatsapp", "call"
    status: str # "sent", "delivered", "failed"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    content: str

class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    price: float

class Batch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="course.id")
    start_date: str
    timings: str
    meeting_link: Optional[str] = None

class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    batch_id: int = Field(foreign_key="batch.id")
    payment_id: str
    status: str = "pending" # "pending", "completed", "failed"
    amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: int = Field(foreign_key="batch.id")
    title: str
    description: str
    deadline: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="assignment.id")
    student_id: int = Field(foreign_key="user.id")
    content: str
    file_url: Optional[str] = None
    status: str = "submitted" # "submitted", "graded"
    feedback: Optional[str] = None
    grade: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class SupportTicket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    subject: str
    message: str
    status: str = "open" # "open", "in_progress", "closed"
    response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Certificate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    course_id: int = Field(foreign_key="course.id")
    issue_date: datetime = Field(default_factory=datetime.utcnow)
    certificate_url: str
