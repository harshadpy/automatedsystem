from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str

class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    role: str = "student"
    course_id: Optional[int] = None

    @validator('phone')
    def validate_phone(cls, v):
        v = v.replace(" ", "").replace("-", "")
        if v.isdigit() and len(v) == 10:
            return v
        if v.startswith("+") and len(v) > 10:
            return v
        if v.isdigit() and len(v) > 10:
             # Assume international without +
             return f"+{v}"
        raise ValueError('Phone number must be 10 digits (India) or E.164 format (e.g. +1234567890)')

class LeadRead(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    city: Optional[str] = None
    role: Optional[str] = "student"
    status: Optional[str] = "new"
    course_id: Optional[int] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    price: float

class CourseRead(BaseModel):
    id: int
    title: str
    description: str
    price: float

class BatchCreate(BaseModel):
    course_id: int
    start_date: str
    timings: str
    meeting_link: Optional[str] = None

class BatchRead(BaseModel):
    id: int
    course_id: int
    start_date: str
    timings: str
    meeting_link: Optional[str]

class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    batch_id: int
    status: str

class AssignmentCreate(BaseModel):
    batch_id: int
    title: str
    description: str
    deadline: str

class AssignmentRead(BaseModel):
    id: int
    batch_id: int
    title: str
    description: str
    deadline: str

class SubmissionCreate(BaseModel):
    assignment_id: int
    content: str
    file_url: Optional[str] = None

class SubmissionRead(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    content: str
    file_url: Optional[str]
    status: str
    feedback: Optional[str]
    grade: Optional[str]

class SupportTicketCreate(BaseModel):
    subject: str
    message: str

class SupportTicketRead(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    status: str
    response: Optional[str]
    created_at: datetime

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

class EmailRequest(BaseModel):
    lead_id: Optional[int] = None
    email: Optional[str] = None
    subject: str
    message: str

class CommunicationLogRead(BaseModel):
    id: int
    lead_id: int
    type: str
    status: str
    timestamp: datetime
    content: str

class BrevoWebhookItem(BaseModel):
    uuid: Optional[str] = None
    messageId: Optional[str] = None
    sender: dict = Field(alias="from")
    subject: Optional[str] = None
    text: Optional[str] = None
    html: Optional[str] = None
    sentAt: Optional[str] = None

class BrevoWebhookPayload(BaseModel):
    items: List[BrevoWebhookItem]
