from fastapi import APIRouter, HTTPException, logger
from models.users import User, SignupData, SigninData
from auth.hash_password import hash_password, verify_password


from auth.jwt_handler import create_access_token
from database.connection import Database
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.users import User, TokenResponse

router = APIRouter()


@router.post("/signup")
async def signup(data: SignupData):
    # Search using Beanie syntax instead of raw mongo
    existing_user = await User.find_one(User.username == data.username.lower())
    if existing_user:
        raise HTTPException(
            status_code=400, detail="A user with that username already exists."
        )

    hashed = hash_password(data.password)

    # Create the user document
    new_user = User(
        name=data.name,
        username=data.username.lower(),
        password=hashed,
    )
    await new_user.create()
    return {"message": "Account created successfully."}


@router.post("/signin", response_model=TokenResponse)
async def signin(user: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    # logger.info(f"User [{user.username}] is signing in the system.")
    print(user)
    db_user = await User.find_one(User.username == user.username.lower())
    if db_user and db_user.active:
        if verify_password(user.password, db_user.password):
            # logger.info(f"\t User [{user.username}] signed in")
            access_token, expiry = create_access_token(
                {"username": db_user.username, "role": db_user.role}
            )
            return TokenResponse(
                username=db_user.username,
                role=db_user.role,
                access_token=access_token,
                expiry=expiry,
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid details passed."
    )
