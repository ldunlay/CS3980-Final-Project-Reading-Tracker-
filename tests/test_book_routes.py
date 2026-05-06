import pytest
from httpx import AsyncClient

from models.models import (
    CurrentBook,
    UpNext,
    FinishedBook,
    CurrentBookRequest,
    UpNextRequest,
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
        rating=4,
        review="Great book!",
    )

    await FinishedBook.insert_one(new_finished_book)

    return new_finished_book


# test of current get books requests


@pytest.mark.anyio
async def test_get_current_books(
    default_client: AsyncClient, mock_current_book: CurrentBook, access_token: str
) -> None:

    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/current-books", headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["_id"] == str(mock_current_book.id)


@pytest.mark.anyio
async def test_get_upnext_books(
    default_client: AsyncClient, mock_upnext_book: UpNext, access_token: str
) -> None:

    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/up-next", headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["_id"] == str(mock_upnext_book.id)


@pytest.mark.anyio
async def test_get_finished_books(
    default_client: AsyncClient, mock_finished_book: FinishedBook, access_token: str
) -> None:

    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/finished-books", headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["_id"] == str(mock_finished_book.id)


# test of add new book requests


@pytest.mark.anyio
async def test_post_new_current_book(
    default_client: AsyncClient, access_token: str
) -> None:
    payload = {
        "title": "Test Book",
        "author": "Test Author",
        "num_pages": 300,
        "genre": "Fiction",
        "isbn": "1234567890",
        "publish_date": "2020-01-01",
        "startDate": "2024-01-01",
        "current_page": 50,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    response = await default_client.post(
        "/api/current-books", json=payload, headers=headers
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Test Book"


@pytest.mark.anyio
async def test_post_new_finished_book(
    default_client: AsyncClient, access_token: str
) -> None:
    payload = {
        "title": "Test Book",
        "author": "Test Author",
        "num_pages": 300,
        "genre": "Fiction",
        "isbn": "1234567890",
        "publish_date": "2020-01-01",
        "startDate": "2024-01-01",
        "finishDate": "2024-02-01",
        "rating": 4,
        "review": "Great book!",
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    response = await default_client.post(
        "/api/finished-books", json=payload, headers=headers
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Test Book"


@pytest.mark.anyio
async def test_post_new_upnext_book(
    default_client: AsyncClient, access_token: str
) -> None:
    payload = {
        "title": "Test Book",
        "author": "Test Author",
        "num_pages": 300,
        "genre": "Fiction",
        "isbn": "1234567890",
        "publish_date": "2020-01-01",
        "added_date": "2024-01-01",
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    response = await default_client.post("/api/up-next", json=payload, headers=headers)

    assert response.status_code == 201
    assert response.json()["title"] == "Test Book"


# test of count


@pytest.mark.anyio
async def test_get_current_books_count(
    default_client: AsyncClient, mock_current_book: CurrentBook, access_token: str
) -> None:
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/current-books", headers=headers)

    books = response.json()

    assert response.status_code == 200
    assert len(books) == 1


@pytest.mark.anyio
async def test_get_finished_books_count(
    default_client: AsyncClient, mock_finished_book: FinishedBook, access_token: str
) -> None:
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/finished-books", headers=headers)

    books = response.json()

    assert response.status_code == 200
    assert len(books) == 1


@pytest.mark.anyio
async def test_get_upnext_books_count(
    default_client: AsyncClient, mock_upnext_book: UpNext, access_token: str
) -> None:
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await default_client.get("/api/up-next", headers=headers)

    books = response.json()

    assert response.status_code == 200
    assert len(books) == 1


# test of edit book requests


@pytest.mark.anyio
async def test_update_current_book(
    default_client: AsyncClient, mock_current_book: CurrentBook, access_token: str
) -> None:
    test_payload = CurrentBookRequest(
        title="Updated Test Book", author="Updated Test Author", startDate="2024-01-15"
    )
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    url = f"/api/current-books/{str(mock_current_book.id)}"

    response = await default_client.put(
        url, content=test_payload.model_dump_json(), headers=headers
    )

    assert response.status_code == 200
    assert response.json()["title"] == test_payload.title


@pytest.mark.anyio
async def test_update_finished_book(
    default_client: AsyncClient, mock_finished_book: FinishedBook, access_token: str
) -> None:
    test_payload = FinishedBookRequest(
        title="Updated Test Book", author="Updated Test Author", finishDate="2024-02-15"
    )
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    url = f"/api/finished-books/{str(mock_finished_book.id)}"

    response = await default_client.put(
        url, content=test_payload.model_dump_json(), headers=headers
    )

    assert response.status_code == 200
    assert response.json()["title"] == test_payload.title


# test of delete requests for books


@pytest.mark.anyio
async def test_delete_current_book(
    default_client: AsyncClient, mock_current_book: CurrentBook, access_token: str
) -> None:
    test_response = {"message": "Book deleted successfully."}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    url = f"/api/current-books/{str(mock_current_book.id)}"

    response = await default_client.delete(url, headers=headers)

    assert response.status_code == 200
    assert response.json() == test_response


@pytest.mark.anyio
async def test_delete_finished_book(
    default_client: AsyncClient, mock_finished_book: FinishedBook, access_token: str
) -> None:
    test_response = {"message": "Finished book deleted successfully."}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    url = f"/api/finished-books/{str(mock_finished_book.id)}"

    response = await default_client.delete(url, headers=headers)

    assert response.status_code == 200
    assert response.json() == test_response


@pytest.mark.anyio
async def test_delete_upnext_book(
    default_client: AsyncClient, mock_upnext_book: UpNext, access_token: str
) -> None:
    test_response = {"message": "Book deleted successfully."}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    url = f"/api/up-next/{str(mock_upnext_book.id)}"

    response = await default_client.delete(url, headers=headers)

    assert response.status_code == 200
    assert response.json() == test_response


# test of download for current books


# test of upload for current books
