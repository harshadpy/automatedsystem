from sqlmodel import Session, select
from .models import User, Lead
from .schemas import UserCreate, LeadCreate
from .auth import get_password_hash

def get_user_by_email(session: Session, email: str):
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

def create_user(session: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(name=user.name, email=user.email, role=user.role, hashed_password=hashed_password)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def create_lead(session: Session, lead: LeadCreate):
    db_lead = Lead(**lead.dict())
    session.add(db_lead)
    session.commit()
    session.refresh(db_lead)
    return db_lead

def get_leads(session: Session, skip: int = 0, limit: int = 100):
    return session.exec(select(Lead).offset(skip).limit(limit)).all()
