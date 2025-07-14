import sqlite3
import os
from pathlib import Path
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path="jarvis.db"):
        self.db_path = Path(__file__).parent / db_path
        self.init_database()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize the SQLite database with required tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                security_question TEXT,
                security_answer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Meetings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT,
                attendees TEXT,
                notes TEXT,
                mom TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                assignee TEXT,
                assignee_email TEXT,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMP,
                last_followup TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Todos table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Emails table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recipient TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                email_type TEXT DEFAULT 'general',
                related_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # System config table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                openai_key TEXT,
                smtp_host TEXT,
                smtp_port INTEGER,
                smtp_user TEXT,
                smtp_pass TEXT,
                user_email TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, name: str, email: str, password: str, security_question: str = None, security_answer: str = None):
        """Create a new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        password_hash = self.hash_password(password)
        
        try:
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, security_question, security_answer)
                VALUES (?, ?, ?, ?, ?)
            """, (name, email, password_hash, security_question, security_answer))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Create default system config
            cursor.execute("""
                INSERT INTO system_config (user_id, user_email)
                VALUES (?, ?)
            """, (user_id, email))
            
            conn.commit()
            conn.close()
            return user_id
            
        except sqlite3.IntegrityError:
            conn.close()
            raise ValueError("Email already exists")
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user credentials"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        password_hash = self.hash_password(password)
        
        cursor.execute("""
            SELECT id, name, email FROM users 
            WHERE email = ? AND password_hash = ?
        """, (email, password_hash))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {"id": user[0], "name": user[1], "email": user[2]}
        return None
    
    def get_user_config(self, user_id: int):
        """Get user system configuration"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT openai_key, smtp_host, smtp_port, smtp_user, smtp_pass, user_email
            FROM system_config WHERE user_id = ?
        """, (user_id,))
        
        config = cursor.fetchone()
        conn.close()
        
        if config:
            return {
                "openai_key": config[0],
                "smtp_host": config[1],
                "smtp_port": config[2],
                "smtp_user": config[3],
                "smtp_pass": config[4],
                "user_email": config[5]
            }
        return None
    
    def update_user_config(self, user_id: int, config: dict):
        """Update user system configuration"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE system_config 
            SET openai_key = ?, smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (config.get('openai_key'), config.get('smtp_host'), config.get('smtp_port'), 
              config.get('smtp_user'), config.get('smtp_pass'), user_id))
        
        conn.commit()
        conn.close()

# Initialize database instance
db = Database()