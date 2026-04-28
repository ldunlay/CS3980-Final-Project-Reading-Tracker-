import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from beanie import init_beanie
from models import CurrentBook, UpNext
from auth.hash_password import hash_password, verify_password
import logging
from logging_setup import setup_logging

from current_books_routes import current_books_router
from upnext_routes import upnext_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "reading_tracker")

app = FastAPI()

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]
users_collection = db["users"]

# for logging
setup_logging()
logger = logging.getLogger(__name__)


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

    hashed_password = hash_password(data.password)
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
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"message": "Signed in successfully."}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutting down...")
    client.close()


async def init():  # init for beanie allows document object mapping
    await init_beanie(database=db, document_models=[CurrentBook, UpNext])


@app.on_event("startup")
async def startup():
    logger.info("Application starts up...")
    await init()


# register routes

app.include_router(
    current_books_router, tags=["Current Books"], prefix="/api/current-books"
)  # routing for current books api

app.include_router(
    upnext_router, tags=["Up Next"], prefix="/api/up-next"
)  # routing for up next api

app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")
