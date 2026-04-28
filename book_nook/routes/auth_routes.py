from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from auth.hash_password import hash_password, verify_password
from database.connection import users_collection

auth_router = APIRouter()


class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str


class SigninData(BaseModel):
    email: EmailStr
    password: str


@auth_router.post("/signup")
async def signup(data: SignupData):
    existing_user = await users_collection.find_one({"email": data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="A user with that email already exists."
        )

    await users_collection.insert_one(
        {
            "name": data.name,
            "username": data.email.lower(),
            "email": data.email.lower(),
            "password": hash_password(data.password).decode(),
        }
    )
    return {"message": "Account created successfully."}


@auth_router.post("/signin")
async def signin(data: SigninData):
    user = await users_collection.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"message": "Signed in successfully."}
