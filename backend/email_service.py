import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from settings import settings

SENDGRID_API_KEY = settings.SENDGRID_API_KEY
FROM_EMAIL = settings.FROM_EMAIL

def send_email(subject: str, content: str, recipient_email: str):
    """
    # Check if necessary environment variables are present
    if not SENDGRID_API_KEY or not FROM_EMAIL:
        print("Error: Missing SendGrid API key or email addresses in environment variables.")
        return 500
    
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    from_email = Email(FROM_EMAIL)
    to_email = To(recipient_email)
    content = Content("text/plain", content)
    mail = Mail(from_email, to_email, subject, content)
    
    try:
        response = sg.send(mail)
        print(f"Email response: {response.status_code} - {response.body.decode('utf-8')}")
        if response.status_code == 202:
            return response.status_code
        else:
            print(f"Error response: {response.status_code} - {response.body.decode('utf-8')}")
            return response.status_code
    except Exception as e:
        print(f"Error sending email: {e}")
        return 500
    """
    # Email configuration
    smtp_server = "host.docker.internal"  # Change if your SMTP server runs on a different host
    smtp_port = 25  # Default port for an SMTP server
    from_email = "info@smartspend.com"

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(content, 'plain'))

    # Send the email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.sendmail(from_email, recipient_email, msg.as_string())
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")