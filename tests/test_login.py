import pytest
from httpx import AsyncClient

from auth.hash_password import hash_password
from models.users import User


# testing is mostly the same as professor, but since we have name field for our user, that had to be added here
@pytest.mark.anyio
async def test_sign_new_user(default_client: AsyncClient) -> None:
    payload = {
        "name": "Test User",
        "email": "python-web-dev@cs.uiowa.edu",
        "password": "test-password",
    }

    headers = {"accept": "application/json", "Content-Type": "application/json"}

    test_response = {"message": "Account created successfully."}
    response = await default_client.post(
        "/api/users/signup", json=payload, headers=headers
    )

    assert response.status_code == 200
    assert response.json() == test_response


@pytest.mark.anyio
async def test_sign_user_in(default_client: AsyncClient) -> None:
    await User.insert_one(
        User(  # our user includes name and email fields
            name="Test User",
            email="test-user@cs.uiowa.edu",
            username="test-user@cs.uiowa.edu",
            password=hash_password(
                "test-password"
            ),  # our password already returns string
        )
    )

    payload = {"username": "test-user@cs.uiowa.edu", "password": "test-password"}

    headers = {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    response = await default_client.post(
        "/api/users/signin", data=payload, headers=headers
    )

    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "test-user@cs.uiowa.edu"
    assert body["role"] == "BasicUser"
    assert isinstance(body["access_token"], str)
    assert "expiry" in body
