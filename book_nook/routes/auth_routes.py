from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from auth.hash_password import hash_password, verify_password
from auth.jwt_handler import create_access_token
from models.users import SignupData, TokenResponse, User

auth_router = APIRouter()


@auth_router.post("/signup")
async def signup(data: SignupData):
    email = data.email.lower()
    existing_user = await User.find_one(User.email == email)

    if existing_user:
        raise HTTPException(
            status_code=400, detail="A user with that email already exists."
        )

    user = User(
        name=data.name,
        username=email,
        email=email,
        password=hash_password(data.password).decode(),
    )
    await user.insert()

    return {"message": "Account created successfully."}


async def _signin(form_data: OAuth2PasswordRequestForm) -> TokenResponse:
    username = form_data.username.lower()
    user = await User.find_one(
        {"$or": [{"username": username}, {"email": username}]}
    )

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    access_token, expiry = create_access_token(
        {"username": user.username, "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        username=user.username,
        role=user.role,
        expiry=expiry,
    )


@auth_router.post("/sign-in", response_model=TokenResponse)
async def signin(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> TokenResponse:
    return await _signin(form_data)


@auth_router.post("/signin", response_model=TokenResponse, include_in_schema=False)
async def signin_alias(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> TokenResponse:
    return await _signin(form_data)
