from fastapi import APIRouter

from models import UpNext, UpNextRequest


upnext_router = APIRouter()


@upnext_router.get("")
async def get_upnext_books():
    upnext_books_list = await UpNext.find_all().to_list()
    return upnext_books_list


@upnext_router.post("", status_code=201)
async def create_new_upnext_book(upnext_book: UpNextRequest) -> UpNext:
    new_upnext_book = UpNext(
        title=upnext_book.title,
        author=upnext_book.author,
        num_pages=upnext_book.num_pages,
        genre=upnext_book.genre,
        isbn=upnext_book.isbn,
        publish_date=upnext_book.publish_date,
        added_date=upnext_book.added_date,
    )

    return await new_upnext_book.insert()
