import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from beanie import init_beanie
from models import CurrentBook

from current_books_routes import current_books_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "reading_tracker")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

app = FastAPI()

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]
users_collection = db["users"]


class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str


class SigninData(BaseModel):
    email: EmailStr
    password: str


@app.get("/")
def root():
    return FileResponse(BASE_DIR / "Frontend" / "signin.html")


@app.post("/api/signup")
async def signup(data: SignupData):
    existing_user = await users_collection.find_one({"email": data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="A user with that email already exists."
        )

    hashed_password = pwd_context.hash(data.password)
    await users_collection.insert_one(
        {
            "name": data.name,
            "username": data.email.lower(),
            "email": data.email.lower(),
            "password": hashed_password,
        }
    )
    return {"message": "Account created successfully."}


@app.post("/api/signin")
async def signin(data: SigninData):
    user = await users_collection.find_one({"email": data.email.lower()})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"message": "Signed in successfully."}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


async def init():  # init for beanie allows document object mapping
    await init_beanie(database=db, document_models=[CurrentBook])



app.include_router(
    current_books_router, tags=["Current Books"], prefix="/api/current-books"
)  # routing for current books api

app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")
