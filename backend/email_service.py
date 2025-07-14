import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from database import db

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        pass
    
    def send_email(self, user_id: int, recipient: str, subject: str, body: str, email_type: str = "general", related_id: int = None) -> bool:
        """Send email using SMTP"""
        try:
            config = db.get_user_config(user_id)
            if not config or not all([config.get('smtp_host'), config.get('smtp_user'), config.get('smtp_pass')]):
                logger.error("SMTP configuration not complete")
                return False
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = config['smtp_user']
            msg['To'] = recipient
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(config['smtp_host'], config['smtp_port'])
            server.starttls()
            server.login(config['smtp_user'], config['smtp_pass'])
            
            text = msg.as_string()
            server.sendmail(config['smtp_user'], recipient, text)
            server.quit()
            
            # Log email in database
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO emails (user_id, recipient, subject, body, email_type, related_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, recipient, subject, body, email_type, related_id))
            conn.commit()
            conn.close()
            
            logger.info(f"Email sent successfully to {recipient}")
            return True
            
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return False
    
    def test_smtp_connection(self, user_id: int) -> bool:
        """Test SMTP connection"""
        try:
            config = db.get_user_config(user_id)
            if not config or not all([config.get('smtp_host'), config.get('smtp_user'), config.get('smtp_pass')]):
                return False
            
            server = smtplib.SMTP(config['smtp_host'], config['smtp_port'])
            server.starttls()
            server.login(config['smtp_user'], config['smtp_pass'])
            server.quit()
            
            return True
            
        except Exception as e:
            logger.error(f"SMTP test failed: {e}")
            return False

# Initialize email service
email_service = EmailService()