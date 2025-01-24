import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from settings import settings


SENDGRID_API_KEY = settings.SENDGRID_API_KEY
FROM_EMAIL = settings.FROM_EMAIL
TO_EMAIL = settings.TO_EMAIL

def send_email(subject: str, content: str):
    # Check if necessary environment variables are present
    if not SENDGRID_API_KEY or not FROM_EMAIL or not TO_EMAIL:
        print("Error: Missing SendGrid API key or email addresses in environment variables.")
        return 500
    
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    from_email = Email(FROM_EMAIL)
    to_email = To(TO_EMAIL)
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
