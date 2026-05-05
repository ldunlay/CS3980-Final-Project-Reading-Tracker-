from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models.users import User, SignupData, SigninData, TokenResponse
from auth.hash_password import hash_password, verify_password
from auth.jwt_handler import create_access_token
from auth.authenticate import authenticate, get_admin_user

router = APIRouter()


@router.post("/signup")
async def signup(data: SignupData):
    # Search using Beanie syntax instead of raw mongo
    existing_user = await User.find_one(User.email == data.email.lower())
    if existing_user:
        raise HTTPException(
            status_code=409, detail="A user with that email already exists."
        )

    hashed = hash_password(data.password)

    # Create the user document
    new_user = User(
        name=data.name,
        email=data.email.lower(),
        username=data.email.lower(),
        password=hashed,
    )
    await new_user.create()
    return {"message": "Account created successfully."}


@router.post("/signin")
async def signin(data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    user = await User.find_one(User.email == data.username.lower())

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token, expiry = create_access_token({"username": user.email, "role": user.role})

    return TokenResponse(
        username=user.email,
        role=user.role,
        access_token=token,
        expiry=expiry,
    )

@router.get("/admin/users", dependencies=[Depends(get_admin_user)])
async def get_all_users():
    return await User.find_all().to_list()


@router.delete("/admin/users/{user_id}", dependencies=[Depends(get_admin_user)])
async def delete_user(user_id: str):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": "User deleted successfully"}