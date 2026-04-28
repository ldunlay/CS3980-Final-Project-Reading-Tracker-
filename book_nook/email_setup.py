import resend
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
resend.api_key = os.getenv("RESEND_API_KEY")
# basic setup, still need to integrate into BookNook
r = resend.Emails.send(
    {
        "from": "donotreply@resend.dev",
        "to": "serenapham519@gmail.com",
        "subject": "Welcome to BookNook!",
        "html": "Thanks for signing up for BookNook. Happy reading!",
    }
)
