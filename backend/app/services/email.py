"""
Email Service
Handles sending emails via SMTP
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

# Email configuration from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@scalegrad.com")


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: str = None
) -> bool:
    """
    Send email via SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        plain_text: Plain text fallback
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = to_email

        # Add plain text version
        if plain_text:
            msg.attach(MIMEText(plain_text, "plain"))

        # Add HTML version
        msg.attach(MIMEText(html_content, "html"))

        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_registration_confirmation(
    user_email: str,
    user_name: str,
    hackathon_name: str
) -> bool:
    """Send registration confirmation email"""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Welcome to {hackathon_name}!</h2>
            <p>Hi {user_name},</p>
            <p>Thank you for registering for {hackathon_name}. We're excited to have you join us!</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Check the hackathon details and timeline</li>
                <li>Form or join a team</li>
                <li>Start working on your project!</li>
            </ul>
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br>Scalegrad Team</p>
        </body>
    </html>
    """
    
    plain_text = f"""
    Welcome to {hackathon_name}!
    
    Hi {user_name},
    
    Thank you for registering for {hackathon_name}. We're excited to have you join us!
    
    Next Steps:
    - Check the hackathon details and timeline
    - Form or join a team
    - Start working on your project!
    
    If you have any questions, feel free to reach out to us.
    
    Best regards,
    Scalegrad Team
    """
    
    return send_email(
        to_email=user_email,
        subject=f"Registration Confirmed - {hackathon_name}",
        html_content=html_content,
        plain_text=plain_text
    )


def send_payment_confirmation(
    user_email: str,
    user_name: str,
    hackathon_name: str,
    amount: float,
    status: str = "SUCCESS"
) -> bool:
    """Send payment confirmation email"""
    
    status_text = "Payment Successful" if status == "SUCCESS" else "Payment Failed"
    status_color = "#28a745" if status == "SUCCESS" else "#dc3545"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>{status_text} - {hackathon_name}</h2>
            <p>Hi {user_name},</p>
            <p>Your payment for {hackathon_name} has been processed.</p>
            <div style="background: {status_color}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Amount:</strong> ₹{amount}</p>
            </div>
            {f'<p>Your registration is now confirmed. You can now form or join a team!</p>' if status == 'SUCCESS' else '<p>Please try again or contact support if you need assistance.</p>'}
            <p>Best regards,<br>Scalegrad Team</p>
        </body>
    </html>
    """
    
    plain_text = f"""
    {status_text} - {hackathon_name}
    
    Hi {user_name},
    
    Your payment for {hackathon_name} has been processed.
    
    Status: {status}
    Amount: ₹{amount}
    
    {f'Your registration is now confirmed. You can now form or join a team!' if status == 'SUCCESS' else 'Please try again or contact support if you need assistance.'}
    
    Best regards,
    Scalegrad Team
    """
    
    return send_email(
        to_email=user_email,
        subject=f"{status_text} - {hackathon_name}",
        html_content=html_content,
        plain_text=plain_text
    )


def send_submission_received(
    user_email: str,
    user_name: str,
    hackathon_name: str,
    submission_title: str
) -> bool:
    """Send submission received confirmation email"""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Submission Received!</h2>
            <p>Hi {user_name},</p>
            <p>Your submission for {hackathon_name} has been received and logged.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p><strong>Hackathon:</strong> {hackathon_name}</p>
                <p><strong>Project:</strong> {submission_title}</p>
            </div>
            <p>The judging process will begin after the submission deadline. You can update your submission until then.</p>
            <p>Best regards,<br>Scalegrad Team</p>
        </body>
    </html>
    """
    
    plain_text = f"""
    Submission Received!
    
    Hi {user_name},
    
    Your submission for {hackathon_name} has been received and logged.
    
    Hackathon: {hackathon_name}
    Project: {submission_title}
    
    The judging process will begin after the submission deadline. You can update your submission until then.
    
    Best regards,
    Scalegrad Team
    """
    
    return send_email(
        to_email=user_email,
        subject=f"Submission Received - {hackathon_name}",
        html_content=html_content,
        plain_text=plain_text
    )


def send_leaderboard_update(
    user_email: str,
    user_name: str,
    hackathon_name: str,
    rank: int,
    score: float
) -> bool:
    """Send leaderboard update email"""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Leaderboard Update - {hackathon_name}</h2>
            <p>Hi {user_name},</p>
            <p>The leaderboard for {hackathon_name} has been updated!</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p><strong>Current Rank:</strong> #{rank}</p>
                <p><strong>Score:</strong> {score}</p>
            </div>
            <p>Keep improving your project to climb higher on the leaderboard!</p>
            <p>Best regards,<br>Scalegrad Team</p>
        </body>
    </html>
    """
    
    plain_text = f"""
    Leaderboard Update - {hackathon_name}
    
    Hi {user_name},
    
    The leaderboard for {hackathon_name} has been updated!
    
    Current Rank: #{rank}
    Score: {score}
    
    Keep improving your project to climb higher on the leaderboard!
    
    Best regards,
    Scalegrad Team
    """
    
    return send_email(
        to_email=user_email,
        subject=f"Leaderboard Update - {hackathon_name}",
        html_content=html_content,
        plain_text=plain_text
    )
