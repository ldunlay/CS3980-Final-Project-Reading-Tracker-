

const api = 'http://127.0.0.1:8000/api/current-books'; // api endpoint for current books list

let data = [];
let bookIdInEdit = 0;


// button for adding new book to current reading list
document.getElementById('add-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msg');
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    const authorInput = document.getElementById('author');
    const startDateInput = document.getElementById('startDate');
    const num_pagesInput = document.getElementById('num_pages');
    const isbnInput = document.getElementById('isbn');
    const publish_dateInput = document.getElementById('publish_date');

    // Validating that user enters title, author, and startdate. The rest can be empty
    if (!titleInput.value || !authorInput.value || !startDateInput.value) {
        msgDiv.innerHTML =
            'Please provide non-empty Title, Author, and StartDate when creating a new current book';
        return;
    }



    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newCurrentBook = JSON.parse(xhr.response);
            data.push(newCurrentBook);
            renderCurrentBooks(data);

            // close modal dialog
            const closeBtn = document.getElementById('close-add-modal');
            closeBtn.click();

            // clean up
            msgDiv.innerHTML = '';
            titleInput.value = '';
            genreInput.value = '';
            authorInput.value = '';
            startDateInput.value = '';
            num_pagesInput.value = "";
            isbnInput.value = "";
            publish_dateInput.value = "";

        }
    };

    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    // parseInt source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
    xhr.send(JSON.stringify({ title: titleInput.value, genre: genreInput.value, author: authorInput.value, startDate: startDateInput.value, publish_date: publish_dateInput.value, isbn: isbnInput.value, num_pages: parseInt(num_pagesInput.value) }));
});


function renderCurrentBooks(data) {
    const bookDiv = document.getElementById('books');
    bookDiv.innerHTML = '';

    data.forEach(book => {
        bookDiv.innerHTML += `
    <div id="book-${book.id}" class="book-box">
        <div class="fw-bold fs-3">Title: ${book.title}</div>
        <pre class="text-secondary ps-2">Genre: ${book.genre}</pre>
        <pre class="text-secondary ps-2">Author: ${book.author}</pre>
        <pre class="text-secondary ps-2">Number of Pages: ${book.num_pages}</pre>
        <pre class="text-secondary ps-2">ISBN: ${book.isbn}</pre>
        <pre class="text-secondary ps-2">Publish Date: ${book.publish_date}</pre>
        <pre class="text-secondary ps-2">StartDate: ${book.startDate}</pre>
        <div>
          <button type="button" class="btn btn-success btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#modal-edit"
            onClick="setBookInEdit(${book.id})"
          >
            Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm"
            onClick="deleteBook(${book.id})"
          >
            Delete
          </button>
        </div>
    </div>
    `;
    });
}

function getAllBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = JSON.parse(xhr.response) || [];
            console.log(data);
            renderCurrentBooks(data);
        }
    };

    xhr.open('GET', api, true);
    xhr.send();
}

// IIFE format
(() => {
    getAllBooks();
})();