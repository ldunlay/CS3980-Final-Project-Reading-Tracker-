

const api = 'http://127.0.0.1:8000/api/current-books'; // api endpoint for current books list


// button for adding new book to current reading list
document.getElementById('add-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msg');
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    const authorInput = document.getElementById('author');
    const startdateInput = document.getElementById('startdate');
    const num_pages = document.getElementById('num_pages');
    const isbn = document.getElementById('isbn');
    const publish_date = document.getElementById('publish_date');

    // Validating that user enters title, author, and startdate. The rest can be empty
    if (!titleInput.value || !authorInput.value || !startdateInput.value) {
        msgDiv.innerHTML =
            'Please provide non-empty Title, Author, and StartDate when creating a new current book';
        return;
    }
});

