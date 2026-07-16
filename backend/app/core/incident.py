import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.security import settings

def send_incident_email(server_name: str, hostname: str, error: str):
    sender_email = "alerts@cloudguard.io"
    receiver_email = "admin@example.com"
    
    message = MIMEMultipart("alternative")
    message["Subject"] = f"CRITICAL: Service Disruption on {server_name}"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = f"""
    CloudGuard Incident Report
    -------------------------
    Server: {server_name}
    Hostname: {hostname}
    Issue: {error}
    
    Status: Offline
    Time: {datetime.datetime.now().isoformat()}
    """
    
    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px;">
        <h2 style="color: #ef4444;">Service Disruption Detected</h2>
        <p><strong>Server:</strong> {server_name}</p>
        <p><strong>Hostname:</strong> {hostname}</p>
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Incident Details:</strong></p>
          <p style="color: #94a3b8;">{error}</p>
        </div>
        <p style="font-size: 12px; color: #64748b;">This is an automated report from CloudGuard.</p>
      </body>
    </html>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    print(f"DEBUG: Sending incident email to {receiver_email}")
    print(f"Subject: {message['Subject']}")

