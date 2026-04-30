const api = 'http://127.0.0.1:8000/api/up-next';

let data = [];
let bookIdInEdit = 0;

// helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Add book ──────────────────────────────────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msg');
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    const authorInput = document.getElementById('author');
    const num_pagesInput = document.getElementById('num_pages');
    const isbnInput = document.getElementById('isbn');
    const publish_dateInput = document.getElementById('publish_date');
    const added_dateInput = document.getElementById('added_date');

    if (!titleInput.value || !authorInput.value) {
        msgDiv.innerHTML = 'Please provide a Title and Author.';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newBook = JSON.parse(xhr.response);
            data.push(newBook);
            renderUpNextBooks(data);

            document.getElementById('close-add-modal').click();

            msgDiv.innerHTML = '';
            titleInput.value = '';
            genreInput.value = '';
            authorInput.value = '';
            num_pagesInput.value = '';
            isbnInput.value = '';
            publish_dateInput.value = '';
            added_dateInput.value = '';
        }
    };

    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
        title: titleInput.value,
        genre: genreInput.value,
        author: authorInput.value,
        publish_date: publish_dateInput.value,
        isbn: isbnInput.value,
        num_pages: parseInt(num_pagesInput.value),
        added_date: added_dateInput.value
    }));
});

// ── Delete book ───────────────────────────────────────────────────────────────
function deleteBook(id) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = data.filter((x) => x._id != id);
            renderUpNextBooks(data);
        }
    };

    xhr.open('DELETE', api + '/' + id, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();
}

// ── Render up next books ──────────────────────────────────────────────────────
function renderUpNextBooks(data) {
    const bookDiv = document.getElementById('books');
    bookDiv.innerHTML = '';

    if (data.length === 0) {
        bookDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No books in your queue yet. Add one!</p>
            </div>`;
        return;
    }

    data.forEach(book => {
        bookDiv.innerHTML += `
        <div id="book-${book._id}" class="book-card">
            <div class="book-title">${book.title}</div>
            <div class="book-meta">
                <div class="book-meta-row">
                    <span class="meta-label">Author</span>
                    <span class="meta-value">${book.author || '—'}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Genre</span>
                    <span class="meta-value">${book.genre || '—'}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Pages</span>
                    <span class="meta-value">${book.num_pages || '—'}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">ISBN</span>
                    <span class="meta-value">${book.isbn || '—'}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Published</span>
                    <span class="meta-value">${formatDate(book.publish_date)}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Added</span>
                    <span class="meta-value">${formatDate(book.added_date)}</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="action-btn delete" onclick="deleteBook('${book._id}')">
                    Delete
                </button>
            </div>
        </div>`;
    });
}

// ── Fetch all books on load ───────────────────────────────────────────────────
function getAllBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = JSON.parse(xhr.response) || [];
            renderUpNextBooks(data);
        }
    };

    xhr.open('GET', api, true);
    xhr.send();
}

(() => { getAllBooks(); })();