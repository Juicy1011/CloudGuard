from typing import Optional
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.security import settings

def fetch_notification_emails(db_session=None, owner_id: Optional[int] = None) -> list[str]:
    recipients = []
    if db_session:
        try:
            from app.models.setting import NotificationEmail
            query = db_session.query(NotificationEmail)
            if owner_id is not None:
                query = query.filter(NotificationEmail.owner_id == owner_id)
            db_emails = query.all()
            recipients = [e.email for e in db_emails if e.email and e.email.strip()]
        except Exception as e:
            print(f"DEBUG: Could not query NotificationEmail table: {e}")
            
    default_email = settings.ALERT_RECEIVER or "cloudguard2026@gmail.com"
    if default_email and default_email not in recipients:
        recipients.append(default_email)
    return recipients

def send_incident_email(
    server_name: str, 
    hostname: str, 
    error: str,
    component_type: str = "server",
    component_name: Optional[str] = None,
    severity: str = "CRITICAL",
    action_hint: Optional[str] = None,
    receiver_email: Optional[str] = None,
    db_session = None,
    owner_id: Optional[int] = None
):
    sender_email = settings.SMTP_USER or "alerts@cloudguard.io"
    
    if receiver_email:
        target_emails = [e.strip() for e in receiver_email.split(",") if e.strip()]
    else:
        target_emails = fetch_notification_emails(db_session, owner_id=owner_id)
    
    if not target_emails:
        print("DEBUG: No alert recipients configured.")
        return

    subject_prefix = f"[{severity}]"
    if component_type == "container" and component_name:
        subject = f"{subject_prefix} Microservice Disruption: '{component_name}' on {server_name}"
    else:
        subject = f"{subject_prefix} Host Disruption: {server_name} ({hostname})"

    label = f"Microservice: {component_name}" if component_name else f"Host: {server_name}"
    hint_html = f"<p><strong>Suggested Action:</strong> {action_hint}</p>" if action_hint else ""
    hint_text = f"Suggested Action: {action_hint}\n" if action_hint else ""

    text = f"""
    CloudGuard Incident Report
    -------------------------
    Severity: {severity}
    Component: {label}
    Hostname: {hostname}
    Issue: {error}
    {hint_text}
    Status: Offline / Unhealthy
    Time: {datetime.datetime.now().isoformat()}
    """
    
    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px;">
        <h2 style="color: { '#ef4444' if severity == 'CRITICAL' else '#f59e0b' };">{severity}: Incident Alert</h2>
        <p><strong>Component:</strong> {label}</p>
        <p><strong>Host:</strong> {server_name} ({hostname})</p>
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Incident Details:</strong></p>
          <p style="color: #94a3b8; font-family: monospace;">{error}</p>
        </div>
        {hint_html}
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This is an automated report from CloudGuard.</p>
      </body>
    </html>
    """

    print(f"DEBUG: Dispatched incident alert to target list: {target_emails}")

    if settings.SMTP_USER and settings.SMTP_PASS:
        try:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                for email_addr in target_emails:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = subject
                    msg["From"] = sender_email
                    msg["To"] = email_addr
                    msg.attach(MIMEText(text, "plain"))
                    msg.attach(MIMEText(html, "html"))
                    server.sendmail(sender_email, email_addr, msg.as_string())
                    print(f"INFO: Sent individual incident email to '{email_addr}'")
        except Exception as e:
            print(f"ERROR: Failed to send email via SMTP: {e}")

def send_otp_email(receiver_email: str, otp_code: str):
    sender_email = settings.SMTP_USER or "security@cloudguard.io"
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "CloudGuard Password Reset Verification Code"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = f"""
    CloudGuard Password Reset Code
    ---------------------------------
    Your verification code is: {otp_code}

    This code will expire in 15 minutes. If you did not request this code, please ignore this email.
    """

    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h2 style="color: #2563eb; margin-top: 0; font-size: 20px;">CloudGuard Password Reset</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested a password reset for your CloudGuard operator account. Use the 6-digit verification code below to complete your reset:</p>
          <div style="background-color: #f1f5f9; text-align: center; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">{otp_code}</span>
          </div>
          <p style="color: #64748b; font-size: 12px;">This code will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    print(f"DEBUG: Dispatched OTP [{otp_code}] to {receiver_email}")

    if settings.SMTP_USER and settings.SMTP_PASS:
        try:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.sendmail(sender_email, receiver_email, message.as_string())
            print(f"INFO: Reset OTP email successfully delivered to {receiver_email}")
        except Exception as e:
            print(f"ERROR: Failed to deliver OTP email via SMTP: {e}")
    else:
        print(f"WARNING: SMTP_USER or SMTP_PASS not configured. OTP [{otp_code}] generated but email not sent via SMTP.")
