"""
Email Service for Enterprise Authentication
Handles SMTP configuration, email templates, and async email delivery
"""

import asyncio
import logging
import os
from typing import Dict, List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import smtplib
from datetime import datetime

try:
    import aiosmtplib
    from jinja2 import Environment, FileSystemLoader, Template
    import aiofiles
except ImportError:
    # Fallback for environments without async email support
    aiosmtplib = None
    Environment = None
    FileSystemLoader = None
    Template = None
    aiofiles = None

logger = logging.getLogger(__name__)

class EmailConfig:
    """Email configuration settings"""
    
    def __init__(self):
        # SMTP Configuration (can be overridden via environment variables)
        self.SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        self.SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        
        # Email settings
        self.FROM_EMAIL = os.getenv("FROM_EMAIL", self.SMTP_USERNAME)
        self.FROM_NAME = os.getenv("FROM_NAME", "Enterprise Authentication")
        self.REPLY_TO = os.getenv("REPLY_TO", self.FROM_EMAIL)
        
        # Template settings
        self.TEMPLATE_DIR = os.getenv("EMAIL_TEMPLATE_DIR", "templates/email")
        
        # Queue settings
        self.MAX_RETRIES = int(os.getenv("EMAIL_MAX_RETRIES", "3"))
        self.RETRY_DELAY = int(os.getenv("EMAIL_RETRY_DELAY", "60"))  # seconds

class EmailTemplate:
    """Email template management"""
    
    def __init__(self, template_dir: str = "templates/email"):
        self.template_dir = template_dir
        self.templates = {}
        self._load_templates()
    
    def _load_templates(self):
        """Load email templates"""
        # Default templates (embedded)
        self.templates = {
            "password_reset": {
                "subject": "Password Reset Request - {{company_name}}",
                "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <h2>Password Reset Request</h2>
        </div>
        <div class="content">
            <p>Hello {{user_name}},</p>
            <p>We received a request to reset your password for your {{company_name}} account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{reset_url}}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{{reset_url}}">{{reset_url}}</a></p>
            <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                    <li>This link will expire in {{expiry_hours}} hours</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>© {{year}} {{company_name}}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
                """,
                "text": """
{{company_name}} - Password Reset Request

Hello {{user_name}},

We received a request to reset your password for your {{company_name}} account.

Please click the following link to reset your password:
{{reset_url}}

SECURITY NOTICE:
- This link will expire in {{expiry_hours}} hours
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you have any questions, please contact our support team.

© {{year}} {{company_name}}. All rights reserved.
This is an automated message, please do not reply to this email.
                """
            },
            "email_verification": {
                "subject": "Verify Your Email - {{company_name}}",
                "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <h2>Welcome! Please Verify Your Email</h2>
        </div>
        <div class="content">
            <p>Hello {{user_name}},</p>
            <p>Thank you for registering with {{company_name}}! To complete your account setup, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="{{verification_url}}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{{verification_url}}">{{verification_url}}</a></p>
            <div class="info">
                <strong>Account Information:</strong>
                <ul>
                    <li>Username: {{username}}</li>
                    <li>Email: {{email}}</li>
                    <li>Registration Date: {{registration_date}}</li>
                </ul>
            </div>
            <p>This verification link will expire in {{expiry_hours}} hours.</p>
        </div>
        <div class="footer">
            <p>© {{year}} {{company_name}}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
                """,
                "text": """
{{company_name}} - Email Verification

Hello {{user_name}},

Thank you for registering with {{company_name}}! To complete your account setup, please verify your email address.

Please click the following link to verify your email:
{{verification_url}}

Account Information:
- Username: {{username}}
- Email: {{email}}
- Registration Date: {{registration_date}}

This verification link will expire in {{expiry_hours}} hours.

© {{year}} {{company_name}}. All rights reserved.
This is an automated message, please do not reply to this email.
                """
            },
            "welcome": {
                "subject": "Welcome to {{company_name}}!",
                "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #6f42c1; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .features { background: white; padding: 20px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
            <h2>Your Account is Ready</h2>
        </div>
        <div class="content">
            <p>Hello {{user_name}},</p>
            <p>Welcome to {{company_name}}! Your account has been successfully created and verified.</p>
            <div class="features">
                <h3>What's Next?</h3>
                <ul>
                    <li>Explore our enterprise automation platform</li>
                    <li>Set up your first automation workflow</li>
                    <li>Connect with our AI-powered task delegation system</li>
                    <li>Access real-time monitoring and analytics</li>
                </ul>
            </div>
            <p>Ready to get started?</p>
            <a href="{{dashboard_url}}" class="button">Access Dashboard</a>
            <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
            <p>© {{year}} {{company_name}}. All rights reserved.</p>
            <p>Need help? Contact us at {{support_email}}</p>
        </div>
    </div>
</body>
</html>
                """,
                "text": """
Welcome to {{company_name}}!

Hello {{user_name}},

Welcome to {{company_name}}! Your account has been successfully created and verified.

What's Next?
- Explore our enterprise automation platform
- Set up your first automation workflow  
- Connect with our AI-powered task delegation system
- Access real-time monitoring and analytics

Ready to get started? Visit: {{dashboard_url}}

If you have any questions, our support team is here to help!

© {{year}} {{company_name}}. All rights reserved.
Need help? Contact us at {{support_email}}
                """
            }
        }
    
    def render_template(self, template_name: str, context: Dict) -> Dict[str, str]:
        """Render email template with context"""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        template = self.templates[template_name]
        
        # Add default context
        default_context = {
            "company_name": "Enterprise Automation Platform",
            "year": datetime.now().year,
            "support_email": "support@enterprise.com",
            "dashboard_url": "http://localhost:3000",
            "expiry_hours": "24"
        }
        
        # Merge contexts
        full_context = {**default_context, **context}
        
        # Render templates
        if Template:
            subject_template = Template(template["subject"])
            html_template = Template(template["html"])
            text_template = Template(template["text"])
            
            return {
                "subject": subject_template.render(**full_context),
                "html": html_template.render(**full_context),
                "text": text_template.render(**full_context)
            }
        else:
            # Fallback simple string replacement
            subject = template["subject"]
            html = template["html"]
            text = template["text"]
            
            for key, value in full_context.items():
                placeholder = f"{{{{{key}}}}}"
                subject = subject.replace(placeholder, str(value))
                html = html.replace(placeholder, str(value))
                text = text.replace(placeholder, str(value))
            
            return {
                "subject": subject,
                "html": html,
                "text": text
            }

class EmailQueue:
    """Simple email queue for reliability"""
    
    def __init__(self, max_retries: int = 3):
        self.queue = []
        self.max_retries = max_retries
        self.processing = False
    
    async def add_email(self, email_data: Dict):
        """Add email to queue"""
        email_data["retries"] = 0
        email_data["queued_at"] = datetime.now().isoformat()
        self.queue.append(email_data)
        
        if not self.processing:
            asyncio.create_task(self._process_queue())
    
    async def _process_queue(self):
        """Process email queue"""
        self.processing = True
        
        while self.queue:
            email_data = self.queue.pop(0)
            
            try:
                await self._send_email(email_data)
                logger.info(f"Email sent successfully to {email_data['to']}")
            except Exception as e:
                email_data["retries"] += 1
                
                if email_data["retries"] < self.max_retries:
                    logger.warning(f"Email failed, retrying ({email_data['retries']}/{self.max_retries}): {e}")
                    self.queue.append(email_data)
                    await asyncio.sleep(60)  # Wait before retry
                else:
                    logger.error(f"Email failed permanently after {self.max_retries} retries: {e}")
        
        self.processing = False
    
    async def _send_email(self, email_data: Dict):
        """Send individual email"""
        # This will be implemented in EmailService
        pass

class EmailService:
    """Main email service class"""

    def __init__(self, config: EmailConfig = None):
        self.config = config or EmailConfig()
        self.template_manager = EmailTemplate()
        self.queue = EmailQueue(max_retries=self.config.MAX_RETRIES)

        # Override queue's send method
        self.queue._send_email = self._send_email_smtp

    async def send_password_reset_email(self, email: str, user_name: str, reset_token: str, reset_url: str = None) -> bool:
        """Send password reset email"""

        if not reset_url:
            reset_url = f"http://localhost:3000/auth/reset-password?token={reset_token}"

        context = {
            "user_name": user_name,
            "email": email,
            "reset_url": reset_url,
            "reset_token": reset_token
        }

        return await self._send_template_email("password_reset", email, context)

    async def send_email_verification(self, email: str, user_name: str, username: str, verification_token: str, verification_url: str = None) -> bool:
        """Send email verification email"""

        if not verification_url:
            verification_url = f"http://localhost:3000/auth/verify-email?token={verification_token}"

        context = {
            "user_name": user_name,
            "username": username,
            "email": email,
            "verification_url": verification_url,
            "verification_token": verification_token,
            "registration_date": datetime.now().strftime("%B %d, %Y")
        }

        return await self._send_template_email("email_verification", email, context)

    async def send_welcome_email(self, email: str, user_name: str) -> bool:
        """Send welcome email after successful verification"""

        context = {
            "user_name": user_name,
            "email": email
        }

        return await self._send_template_email("welcome", email, context)

    async def _send_template_email(self, template_name: str, to_email: str, context: Dict) -> bool:
        """Send email using template"""

        try:
            # Render template
            rendered = self.template_manager.render_template(template_name, context)

            # Prepare email data
            email_data = {
                "to": to_email,
                "subject": rendered["subject"],
                "html": rendered["html"],
                "text": rendered["text"],
                "template": template_name
            }

            # Add to queue
            await self.queue.add_email(email_data)
            return True

        except Exception as e:
            logger.error(f"Failed to send {template_name} email to {to_email}: {e}")
            return False

    async def _send_email_smtp(self, email_data: Dict):
        """Send email via SMTP"""

        if not self.config.SMTP_USERNAME or not self.config.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured, email not sent")
            # In development, just log the email
            logger.info(f"EMAIL WOULD BE SENT TO: {email_data['to']}")
            logger.info(f"SUBJECT: {email_data['subject']}")
            logger.info(f"CONTENT: {email_data['text'][:200]}...")
            return

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = email_data['subject']
            msg['From'] = f"{self.config.FROM_NAME} <{self.config.FROM_EMAIL}>"
            msg['To'] = email_data['to']
            msg['Reply-To'] = self.config.REPLY_TO

            # Add text and HTML parts
            text_part = MIMEText(email_data['text'], 'plain', 'utf-8')
            html_part = MIMEText(email_data['html'], 'html', 'utf-8')

            msg.attach(text_part)
            msg.attach(html_part)

            # Send email
            if aiosmtplib:
                # Use async SMTP
                await aiosmtplib.send(
                    msg,
                    hostname=self.config.SMTP_HOST,
                    port=self.config.SMTP_PORT,
                    start_tls=self.config.SMTP_USE_TLS,
                    username=self.config.SMTP_USERNAME,
                    password=self.config.SMTP_PASSWORD,
                )
            else:
                # Fallback to synchronous SMTP
                with smtplib.SMTP(self.config.SMTP_HOST, self.config.SMTP_PORT) as server:
                    if self.config.SMTP_USE_TLS:
                        server.starttls()
                    server.login(self.config.SMTP_USERNAME, self.config.SMTP_PASSWORD)
                    server.send_message(msg)

            logger.info(f"Email sent successfully to {email_data['to']}")

        except Exception as e:
            logger.error(f"SMTP error sending email to {email_data['to']}: {e}")
            raise

    def configure_smtp(self, host: str, port: int, username: str, password: str, use_tls: bool = True):
        """Configure SMTP settings"""
        self.config.SMTP_HOST = host
        self.config.SMTP_PORT = port
        self.config.SMTP_USERNAME = username
        self.config.SMTP_PASSWORD = password
        self.config.SMTP_USE_TLS = use_tls
        self.config.FROM_EMAIL = username

    def get_queue_status(self) -> Dict:
        """Get email queue status"""
        return {
            "queue_length": len(self.queue.queue),
            "processing": self.queue.processing,
            "max_retries": self.queue.max_retries
        }

# Global email service instance
email_service = EmailService()
