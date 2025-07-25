from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List
from datetime import datetime, timedelta
import sqlite3

# Import custom modules
from database import db
from auth import create_access_token, get_current_user
from openai_service import openai_service
from email_service import email_service
from models import *

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Jarvis AI Assistant", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication Routes
@api_router.post("/register")
async def register(user_data: UserRegister):
    try:
        user_id = db.create_user(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password,
            security_question=user_data.security_question,
            security_answer=user_data.security_answer
        )
        return {"message": "User registered successfully", "user_id": user_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/login")
async def login(user_data: UserLogin):
    user = db.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.post("/forgot-password/verify")
async def verify_forgot_password(data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT security_question FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not user[0]:
        raise HTTPException(status_code=404, detail="User not found or no security question set")
    
    return {"security_question": user[0]}

@api_router.post("/forgot-password/reset")
async def reset_password(data: dict):
    email = data.get("email")
    security_answer = data.get("security_answer")
    new_password = data.get("new_password")
    
    if not all([email, security_answer, new_password]):
        raise HTTPException(status_code=400, detail="All fields are required")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Verify security answer
    cursor.execute("SELECT security_answer FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if not user or user[0] != security_answer:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid security answer")
    
    # Update password
    new_password_hash = db.hash_password(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (new_password_hash, email))
    conn.commit()
    conn.close()
    
    return {"message": "Password reset successfully"}

@api_router.get("/me")
async def get_current_user_info(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": user[0], "name": user[1], "email": user[2]}

# System Configuration Routes
@api_router.get("/config")
async def get_system_config(user_id: int = Depends(get_current_user)):
    config = db.get_user_config(user_id)
    if not config:
        return {"openai_key": None, "smtp_host": None, "smtp_port": None, "smtp_user": None, "smtp_pass": None}
    
    # Don't return sensitive data
    return {
        "openai_key": "***" if config.get('openai_key') else None,
        "smtp_host": config.get('smtp_host'),
        "smtp_port": config.get('smtp_port'),
        "smtp_user": config.get('smtp_user'),
        "smtp_pass": "***" if config.get('smtp_pass') else None
    }

@api_router.post("/config")
async def update_system_config(config: SystemConfig, user_id: int = Depends(get_current_user)):
    try:
        # Test OpenAI API if provided
        openai_test_result = False
        openai_error = None
        if config.openai_key and config.openai_key.strip():
            try:
                # Test OpenAI API
                from openai import OpenAI
                test_client = OpenAI(api_key=config.openai_key)
                response = test_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=5
                )
                openai_test_result = True
            except Exception as e:
                openai_error = str(e)
        
        # Test SMTP if provided
        smtp_test_result = False
        smtp_error = None
        if all([config.smtp_host, config.smtp_port, config.smtp_user, config.smtp_pass]):
            try:
                import smtplib
                server = smtplib.SMTP(config.smtp_host, config.smtp_port)
                server.starttls()
                server.login(config.smtp_user, config.smtp_pass)
                server.quit()
                smtp_test_result = True
            except Exception as e:
                smtp_error = str(e)
        
        # Save configuration to database
        db.update_user_config(user_id, config.dict())
        
        # Prepare response message
        response_msg = "Configuration saved successfully!\n\n"
        
        if config.openai_key:
            if openai_test_result:
                response_msg += "✅ OpenAI API: Connected successfully\n"
            else:
                response_msg += f"❌ OpenAI API: Connection failed - {openai_error}\n"
        else:
            response_msg += "⚠️ OpenAI API: No API key provided\n"
        
        if all([config.smtp_host, config.smtp_user, config.smtp_pass]):
            if smtp_test_result:
                response_msg += "✅ SMTP: Connected successfully\n"
            else:
                response_msg += f"❌ SMTP: Connection failed - {smtp_error}\n"
        else:
            response_msg += "⚠️ SMTP: Configuration incomplete\n"
        
        return {
            "message": response_msg,
            "openai_connected": openai_test_result,
            "smtp_connected": smtp_test_result,
            "openai_error": openai_error,
            "smtp_error": smtp_error
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration update failed: {str(e)}")

# Chat Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_jarvis(message: ChatMessage, user_id: int = Depends(get_current_user)):
    try:
        # Process the message and detect commands
        response = openai_service.generate_response(user_id, message.message, message.context)
        
        # Detect commands
        command_detected = None
        action_required = None
        
        msg_lower = message.message.lower()
        if "start meeting" in msg_lower:
            command_detected = "start_meeting"
            action_required = "collect_meeting_details"
        elif "end meeting" in msg_lower:
            command_detected = "end_meeting"
            action_required = "generate_mom"
        elif "create task" in msg_lower:
            command_detected = "create_task"
            action_required = "collect_task_details"
        elif "create todo" in msg_lower:
            command_detected = "create_todo"
            action_required = "collect_todo_details"
        elif "send email" in msg_lower:
            command_detected = "send_email"
            action_required = "collect_email_details"
        elif "system check" in msg_lower:
            command_detected = "system_check"
            action_required = "run_system_check"
        
        return ChatResponse(
            response=response,
            command_detected=command_detected,
            action_required=action_required
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# Meeting Routes
@api_router.post("/meetings/start")
async def start_meeting(meeting: MeetingStart, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO meetings (user_id, title, attendees, notes, status)
        VALUES (?, ?, ?, ?, 'active')
    """, (user_id, meeting.title, meeting.attendees, "", ))
    
    meeting_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"meeting_id": meeting_id, "message": "Meeting started successfully"}

@api_router.post("/meetings/{meeting_id}/notes")
async def add_meeting_note(meeting_id: int, note: MeetingNote, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get current notes
    cursor.execute("SELECT notes FROM meetings WHERE id = ? AND user_id = ?", (meeting_id, user_id))
    current_notes = cursor.fetchone()
    
    if not current_notes:
        conn.close()
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Append new note
    updated_notes = (current_notes[0] or "") + "\n" + note.note
    
    cursor.execute("""
        UPDATE meetings SET notes = ? WHERE id = ? AND user_id = ?
    """, (updated_notes, meeting_id, user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Note added successfully"}

@api_router.post("/meetings/{meeting_id}/end")
async def end_meeting(meeting_id: int, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get meeting details
    cursor.execute("""
        SELECT title, attendees, notes FROM meetings 
        WHERE id = ? AND user_id = ? AND status = 'active'
    """, (meeting_id, user_id))
    
    meeting = cursor.fetchone()
    if not meeting:
        conn.close()
        raise HTTPException(status_code=404, detail="Active meeting not found")
    
    # Generate MoM using OpenAI
    mom = openai_service.generate_mom(user_id, meeting[0], meeting[1], meeting[2])
    
    # Update meeting
    cursor.execute("""
        UPDATE meetings 
        SET status = 'completed', ended_at = CURRENT_TIMESTAMP, mom = ?
        WHERE id = ? AND user_id = ?
    """, (mom, meeting_id, user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Meeting ended successfully", "mom": mom, "meeting_id": meeting_id}

@api_router.get("/meetings", response_model=List[Meeting])
async def get_meetings(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, attendees, notes, mom, status, created_at, ended_at
        FROM meetings WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    
    meetings = cursor.fetchall()
    conn.close()
    
    return [
        Meeting(
            id=m[0], title=m[1], attendees=m[2], notes=m[3], mom=m[4],
            status=m[5], created_at=m[6], ended_at=m[7]
        ) for m in meetings
    ]

# Task Routes
@api_router.post("/tasks")
async def create_task(task: TaskCreate, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO tasks (user_id, title, description, assignee, assignee_email, priority, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, task.title, task.description, task.assignee, task.assignee_email, task.priority, task.due_date))
    
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Send assignment email if assignee email is provided
    if task.assignee_email:
        email_draft = openai_service.draft_email(
            user_id, 
            task.assignee_email, 
            f"Task: {task.title}\nDescription: {task.description}\nPriority: {task.priority}", 
            "task_assignment"
        )
        
        if "error" not in email_draft:
            email_service.send_email(
                user_id, 
                task.assignee_email, 
                email_draft["subject"], 
                email_draft["body"], 
                "task_assignment",
                task_id
            )
    
    return {"task_id": task_id, "message": "Task created successfully"}

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, description, assignee, assignee_email, priority, status, created_at, due_date, last_followup
        FROM tasks WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    
    tasks = cursor.fetchall()
    conn.close()
    
    return [
        Task(
            id=t[0], title=t[1], description=t[2], assignee=t[3], assignee_email=t[4],
            priority=t[5], status=t[6], created_at=t[7], due_date=t[8], last_followup=t[9]
        ) for t in tasks
    ]

@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: int, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE tasks SET status = 'completed' WHERE id = ? AND user_id = ?
    """, (task_id, user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Task marked as completed"}

# Todo Routes
@api_router.post("/todos")
async def create_todo(todo: TodoCreate, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO todos (user_id, title, description)
        VALUES (?, ?, ?)
    """, (user_id, todo.title, todo.description))
    
    todo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"todo_id": todo_id, "message": "Todo created successfully"}

@api_router.get("/todos", response_model=List[Todo])
async def get_todos(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, description, status, created_at, completed_at
        FROM todos WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    
    todos = cursor.fetchall()
    conn.close()
    
    return [
        Todo(
            id=t[0], title=t[1], description=t[2], status=t[3], 
            created_at=t[4], completed_at=t[5]
        ) for t in todos
    ]

@api_router.put("/todos/{todo_id}/complete")
async def complete_todo(todo_id: int, user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE todos SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
    """, (todo_id, user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Todo marked as completed"}

# Email Routes
@api_router.post("/emails/send")
async def send_email(email: EmailSend, user_id: int = Depends(get_current_user)):
    success = email_service.send_email(
        user_id, email.recipient, email.subject, email.body, email.email_type
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {"message": "Email sent successfully"}

@api_router.post("/emails/draft")
async def draft_email(email: EmailDraft, user_id: int = Depends(get_current_user)):
    draft = openai_service.draft_email(user_id, email.recipient, email.context, email.email_type)
    
    if "error" in draft:
        raise HTTPException(status_code=500, detail=draft["error"])
    
    return draft

@api_router.get("/emails", response_model=List[Email])
async def get_emails(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, recipient, subject, body, sent_at, email_type
        FROM emails WHERE user_id = ? ORDER BY sent_at DESC LIMIT 20
    """, (user_id,))
    
    emails = cursor.fetchall()
    conn.close()
    
    return [
        Email(
            id=e[0], recipient=e[1], subject=e[2], body=e[3], 
            sent_at=e[4], email_type=e[5]
        ) for e in emails
    ]

# System Routes
@api_router.get("/system/status", response_model=SystemStatus)
async def get_system_status(user_id: int = Depends(get_current_user)):
    # Get user configuration
    config = db.get_user_config(user_id)
    
    openai_connected = False
    smtp_connected = False
    openai_error = None
    smtp_error = None
    
    # Test OpenAI connection if API key exists
    if config and config.get('openai_key'):
        try:
            from openai import OpenAI
            test_client = OpenAI(api_key=config['openai_key'])
            response = test_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            openai_connected = True
        except Exception as e:
            openai_error = str(e)
    
    # Test SMTP connection if configuration exists
    if config and all([config.get('smtp_host'), config.get('smtp_user'), config.get('smtp_pass')]):
        try:
            import smtplib
            server = smtplib.SMTP(config['smtp_host'], config['smtp_port'])
            server.starttls()
            server.login(config['smtp_user'], config['smtp_pass'])
            server.quit()
            smtp_connected = True
        except Exception as e:
            smtp_error = str(e)
    
    # Database is always connected if we reach here
    database_connected = True
    
    # Build status message
    status_message = "> Initializing Jarvis AI...\n"
    status_message += f"> Checking GPT API Key: {'✅' if openai_connected else '❌'}"
    if openai_error:
        status_message += f" ({openai_error[:50]}...)" if len(openai_error) > 50 else f" ({openai_error})"
    status_message += "\n"
    
    status_message += f"> Verifying SMTP Connection: {'✅' if smtp_connected else '❌'}"
    if smtp_error:
        status_message += f" ({smtp_error[:50]}...)" if len(smtp_error) > 50 else f" ({smtp_error})"
    status_message += "\n"
    
    status_message += f"> Connecting to SQLite DB: {'✅' if database_connected else '❌'}\n"
    
    if openai_connected and smtp_connected:
        status_message += "> All systems online. Ready to assist."
    elif openai_connected:
        status_message += "> AI ready. Email configuration needed."
    elif smtp_connected:
        status_message += "> Email ready. AI configuration needed."
    else:
        status_message += "> Configuration required. Please update settings."
    
    return SystemStatus(
        openai_connected=openai_connected,
        smtp_connected=smtp_connected,
        database_connected=database_connected,
        message=status_message
    )

# Dashboard Route
@api_router.get("/dashboard", response_model=DashboardData)
async def get_dashboard(user_id: int = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get recent meetings
    cursor.execute("""
        SELECT id, title, attendees, notes, mom, status, created_at, ended_at
        FROM meetings WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    """, (user_id,))
    meetings = cursor.fetchall()
    
    # Get active tasks
    cursor.execute("""
        SELECT id, title, description, assignee, assignee_email, priority, status, created_at, due_date, last_followup
        FROM tasks WHERE user_id = ? AND status != 'completed' ORDER BY created_at DESC
    """, (user_id,))
    tasks = cursor.fetchall()
    
    # Get pending todos
    cursor.execute("""
        SELECT id, title, description, status, created_at, completed_at
        FROM todos WHERE user_id = ? AND status != 'completed' ORDER BY created_at DESC
    """, (user_id,))
    todos = cursor.fetchall()
    
    # Get recent emails
    cursor.execute("""
        SELECT id, recipient, subject, body, sent_at, email_type
        FROM emails WHERE user_id = ? ORDER BY sent_at DESC LIMIT 5
    """, (user_id,))
    emails = cursor.fetchall()
    
    conn.close()
    
    return DashboardData(
        recent_meetings=[
            Meeting(
                id=m[0], title=m[1], attendees=m[2], notes=m[3], mom=m[4],
                status=m[5], created_at=m[6], ended_at=m[7]
            ) for m in meetings
        ],
        active_tasks=[
            Task(
                id=t[0], title=t[1], description=t[2], assignee=t[3], assignee_email=t[4],
                priority=t[5], status=t[6], created_at=t[7], due_date=t[8], last_followup=t[9]
            ) for t in tasks
        ],
        pending_todos=[
            Todo(
                id=t[0], title=t[1], description=t[2], status=t[3], 
                created_at=t[4], completed_at=t[5]
            ) for t in todos
        ],
        recent_emails=[
            Email(
                id=e[0], recipient=e[1], subject=e[2], body=e[3], 
                sent_at=e[4], email_type=e[5]
            ) for e in emails
        ]
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
