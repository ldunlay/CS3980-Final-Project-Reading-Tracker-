from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException


from models import CurrentBook, CurrentBookRequest


current_books_router = APIRouter()


@current_books_router.get("")
async def get_current_books():
    current_books_list = await CurrentBook.find_all().to_list()
    return current_books_list


@current_books_router.post("", status_code=201)
async def create_new_current_book(currentBook: CurrentBookRequest) -> CurrentBook:
    new_current_book = CurrentBook(
        title=currentBook.title,
        author=currentBook.author,
        num_pages=currentBook.num_pages,
        genre=currentBook.genre,
        isbn=currentBook.isbn,
        publish_date=currentBook.publish_date,
        startDate=currentBook.startDate,
        current_page=currentBook.current_page,
    )

    return await new_current_book.insert()


@current_books_router.put("/{book_id}", status_code=200)
async def edit_current_book(
    book_id: PydanticObjectId, editCurrentBook: CurrentBookRequest
) -> CurrentBook:

    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book:
        raise HTTPException(
            status_code=404, detail="Book not found"
        )  # if it is not found, raise error

    book.title = editCurrentBook.title
    book.author = editCurrentBook.author
    book.num_pages = editCurrentBook.num_pages
    book.genre = editCurrentBook.genre
    book.isbn = editCurrentBook.isbn
    book.publish_date = editCurrentBook.publish_date
    book.startDate = editCurrentBook.startDate
    book.current_page = editCurrentBook.current_page

    await book.save()  # save it to mongodb
    return book


@current_books_router.delete("/{book_id}", status_code=204)
async def delete_current_book(book_id: PydanticObjectId):
    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book:
        raise HTTPException(
            status_code=404, detail="Book not found"
        )  # if it is not found, raise error

    await book.delete()  # delete from mongo db
    return
