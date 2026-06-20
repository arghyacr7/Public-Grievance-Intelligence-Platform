import os
import smtplib
from email.message import EmailMessage



def send_status_update_email(to_email: str, status: str, title: str) -> bool:
    smtp_server = os.environ.get("SMTP_SERVER")
    smtp_port = os.environ.get("SMTP_PORT", "587")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    sender_email = os.environ.get("SENDER_EMAIL")

    if not all([smtp_server, smtp_user, smtp_password, sender_email]):
        return False

    msg = EmailMessage()
    msg['Subject'] = f'Civic AI - Report Update: {status}'
    msg['From'] = f"Civic AI <{sender_email}>"
    msg['To'] = to_email

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1d1d1f; margin-top: 0;">Update on Your Report</h2>
          <p style="color: #48484a; line-height: 1.5;">The status of your report <strong>"{title}"</strong> has been updated to:</p>
          <div style="display: inline-block; background-color: #f4f4f5; color: #1d1d1f; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 15px; margin-bottom: 15px; font-size: 1.2em;">
            {status}
          </div>
          <p style="color: #86868b; font-size: 14px; margin-bottom: 0;">Log in to the Civic AI portal to track the progress.</p>
        </div>
      </body>
    </html>
    """
    
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False
