from fastapi import APIRouter
from email_service import send_email

router = APIRouter(
    tags=["Budget"],
    prefix="/api"
)

@router.post("/notify-budget-exceeded")
async def notify_budget_exceeded(budget: float, actual_spent: float):
    if actual_spent > budget:
        subject = "Budget Exceeded!"
        content = f"You have exceeded your budget. Your set budget was ${budget} and you've spent ${actual_spent}."
        status_code = send_email(subject, content)
        
        if status_code == 202:
            return {"message": "Email sent successfully!"}
        elif status_code == 500:
            return {"message": "Failed to send email. Please check the server logs for details."}
        else:
            return {"message": f"Email sending failed with status code {status_code}."}
    else:
        return {"message": "No action needed. Budget is within limits."}
