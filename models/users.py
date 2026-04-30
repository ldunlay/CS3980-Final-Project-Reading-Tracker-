from beanie import Document
from pydantic import EmailStr, BaseModel

# This is for the Database (MongoDB)
class User(Document):
    name: str
    email: EmailStr
    username: str
    password: str  # This will store the hashed password

    class Settings:
        name = "users"  # The collection name in Mongo

# These are for API Input Validation (Request Models)
class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str

class SigninData(BaseModel):
    email: EmailStr
    password: str