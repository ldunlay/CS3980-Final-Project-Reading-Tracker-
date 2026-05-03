import pytest
from httpx import AsyncClient

from models.models import (
    CurrentBook,
    CurrentBookRequest,
    UpNext,
    UpNextRequest,
    FinishedBook,
    FinishedBookRequest,
)

# creation of book objects test


@pytest.fixture
async def mock_current_book() -> CurrentBook:
    # Clean up resources
    await CurrentBook.find_all().delete()

    new_current_book = CurrentBook(
        owner_username="python-web-dev@cs.uiowa.edu",
        title="Test Book",
        author="Test Author",
        num_pages=300,
        genre="Fiction",
        isbn="1234567890",
        publish_date="2020-01-01",
        startDate="2024-01-01",
        current_page=50,
    )

    await CurrentBook.insert_one(new_current_book)

    return new_current_book


@pytest.fixture
async def mock_upnext_book() -> UpNext:
    # Clean up resources
    await UpNext.find_all().delete()

    new_upnext_book = UpNext(
        owner_username="python-web-dev@cs.uiowa.edu",
        title="Test Book",
        author="Test Author",
        num_pages=300,
        genre="Fiction",
        isbn="1234567890",
        publish_date="2020-01-01",
        added_date="2024-01-01",
    )

    await UpNext.insert_one(new_upnext_book)

    return new_upnext_book


@pytest.fixture
async def mock_finished_book() -> FinishedBook:
    # Clean up resources
    await FinishedBook.find_all().delete()

    new_finished_book = FinishedBook(
        owner_username="python-web-dev@cs.uiowa.edu",
        title="Test Book",
        author="Test Author",
        num_pages=300,
        genre="Fiction",
        isbn="1234567890",
        publish_date="2020-01-01",
        startDate="2024-01-01",
        finishDate="2024-02-01",
        rate=4,
        review="Great book!",
    )

    await FinishedBook.insert_one(new_finished_book)

    return new_finished_book


# test of current books requests


@pytest.mark.anyio
async def test_get_current_books(
    default_client: AsyncClient, mock_current_book: CurrentBook, access_token: str
) -> None:
    response = await default_client.get("/api/current-books")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/current-books", headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["_id"] == str(mock_current_book.id)
