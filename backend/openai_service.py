try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    
import logging
from typing import Optional
from database import db

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = None
    
    def initialize_client(self, api_key: str):
        """Initialize OpenAI client with API key"""
        if not OPENAI_AVAILABLE:
            logger.error("OpenAI library not installed")
            return False
            
        try:
            self.client = OpenAI(api_key=api_key)
            # Test the connection
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return True
        except Exception as e:
            logger.error(f"OpenAI initialization failed: {e}")
            return False
    
    def generate_response(self, user_id: int, message: str, context: str = "") -> str:
        """Generate AI response using GPT"""
        if not OPENAI_AVAILABLE:
            return "OpenAI library not installed. Please install it using: pip install openai"
            
        try:
            config = db.get_user_config(user_id)
            if not config or not config.get('openai_key'):
                return "OpenAI API key not configured. Please configure it in system settings."
            
            # Initialize client for each request
            client = OpenAI(api_key=config['openai_key'])
            
            # Jarvis personality prompt
            system_prompt = """You are Jarvis, an AI personal assistant created by Sumit Roy. 
            You help with meetings, tasks, to-dos, and emails. You are professional, helpful, and efficient.
            You operate in a terminal-style interface with green text on black background.
            
            Commands you understand:
            - "start meeting" - Begin a new meeting
            - "end meeting" - End current meeting and generate MoM
            - "create task" - Create a new task
            - "create todo" - Create a new to-do item
            - "show tasks" - Display all tasks
            - "show todos" - Display all to-do items
            - "send email to [name]" - Send an email
            - "complete task [id]" - Mark task as complete
            - "system check" - Check system status
            
            When asked who created you, respond: "I was created by Sumit Roy."
            
            Keep responses concise and terminal-friendly. Use > prefix for system messages.
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context: {context}\n\nUser: {message}"}
            ]
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return f"AI service error: {str(e)}"
    
    def generate_mom(self, user_id: int, meeting_title: str, attendees: str, notes: str) -> str:
        """Generate Meeting Minutes using GPT"""
        if not OPENAI_AVAILABLE:
            return "OpenAI library not installed. Please install it using: pip install openai"
            
        try:
            config = db.get_user_config(user_id)
            if not config or not config.get('openai_key'):
                return "OpenAI API key not configured."
            
            # Initialize client for each request
            client = OpenAI(api_key=config['openai_key'])
            
            prompt = f"""Generate professional Meeting Minutes (MoM) from the following:
            
            Meeting Title: {meeting_title}
            Attendees: {attendees}
            Notes: {notes}
            
            Format:
            Subject: [Meeting Title]
            Date: [Current Date]
            Attendees: [List of attendees]
            
            Meeting Summary:
            • [Key point 1]
            • [Key point 2]
            • [Key point 3]
            
            Action Items:
            • [Action item 1]
            • [Action item 2]
            
            Signed by: [User Name]
            Powered by: Jarvis AI Assistant
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"MoM generation error: {e}")
            return f"Failed to generate MoM: {str(e)}"
    
    def draft_email(self, user_id: int, recipient: str, context: str, email_type: str = "general") -> dict:
        """Draft email using GPT"""
        if not OPENAI_AVAILABLE:
            return {"error": "OpenAI library not installed. Please install it using: pip install openai"}
            
        try:
            config = db.get_user_config(user_id)
            if not config or not config.get('openai_key'):
                return {"error": "OpenAI API key not configured."}
            
            # Initialize client for each request
            client = OpenAI(api_key=config['openai_key'])
            
            if email_type == "task_assignment":
                prompt = f"""Draft a professional email for task assignment:
                
                Recipient: {recipient}
                Context: {context}
                
                Create a professional email with:
                - Clear subject line
                - Professional greeting
                - Task description and requirements
                - Deadline if mentioned
                - Professional closing
                
                Format as:
                Subject: [subject]
                Body: [email body]
                """
            else:
                prompt = f"""Draft a professional email:
                
                Recipient: {recipient}
                Context: {context}
                
                Create a well-structured email with appropriate subject and body.
                
                Format as:
                Subject: [subject]
                Body: [email body]
                """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
                temperature=0.5
            )
            
            content = response.choices[0].message.content
            
            # Parse subject and body
            lines = content.split('\n')
            subject = ""
            body = ""
            
            for i, line in enumerate(lines):
                if line.startswith("Subject:"):
                    subject = line.replace("Subject:", "").strip()
                elif line.startswith("Body:"):
                    body = '\n'.join(lines[i+1:]).strip()
                    break
            
            return {"subject": subject, "body": body}
            
        except Exception as e:
            logger.error(f"Email drafting error: {e}")
            return {"error": f"Failed to draft email: {str(e)}"}

# Initialize OpenAI service
openai_service = OpenAIService()