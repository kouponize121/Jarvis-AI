from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    security_question: Optional[str] = None
    security_answer: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SystemConfig(BaseModel):
    openai_key: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

# Chat Models
class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = ""

class ChatResponse(BaseModel):
    response: str
    command_detected: Optional[str] = None
    action_required: Optional[str] = None

# Meeting Models
class MeetingStart(BaseModel):
    title: Optional[str] = None
    attendees: Optional[str] = None

class MeetingNote(BaseModel):
    meeting_id: int
    note: str

class Meeting(BaseModel):
    id: int
    title: Optional[str]
    attendees: Optional[str]
    notes: Optional[str]
    mom: Optional[str]
    status: str
    created_at: datetime
    ended_at: Optional[datetime]

# Task Models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    assignee_email: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assignee: Optional[str]
    assignee_email: Optional[str]
    priority: str
    status: str
    created_at: datetime
    due_date: Optional[datetime]
    last_followup: Optional[datetime]

# Todo Models
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Todo(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

# Email Models
class EmailSend(BaseModel):
    recipient: str
    subject: str
    body: str
    email_type: Optional[str] = "general"

class EmailDraft(BaseModel):
    recipient: str
    context: str
    email_type: Optional[str] = "general"

class Email(BaseModel):
    id: int
    recipient: str
    subject: str
    body: str
    sent_at: datetime
    email_type: str

# System Models
class SystemStatus(BaseModel):
    openai_connected: bool
    smtp_connected: bool
    database_connected: bool
    message: str

class DashboardData(BaseModel):
    recent_meetings: List[Meeting]
    active_tasks: List[Task]
    pending_todos: List[Todo]
    recent_emails: List[Email]