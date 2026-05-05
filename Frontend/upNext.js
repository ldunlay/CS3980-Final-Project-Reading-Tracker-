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

// ── Upload cover image ────────────────────────────────────────────────────────
function uploadUpNextCover(bookId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status === 200) {
                const updated = JSON.parse(xhr.response);
                const book = data.find(x => x._id == bookId);
                if (book) book.cover_image = updated.cover_image;
                renderUpNextBooks(data);
            } else {
                alert('Failed to upload cover image.');
            }
        };
        xhr.open('POST', api + '/' + bookId + '/cover', true);
        setAuthHeader(xhr);
        xhr.send(formData);
    };
    input.click();
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
    setAuthHeader(xhr);

    const today = new Date().toISOString().split('T')[0];
    xhr.send(JSON.stringify({
        title: titleInput.value,
        genre: genreInput.value || null,
        author: authorInput.value,
        publish_date: publish_dateInput.value || null,
        isbn: isbnInput.value || null,
        num_pages: num_pagesInput.value ? parseInt(num_pagesInput.value) : null,
        added_date: added_dateInput.value || today
    }));
});

// ── Edit book ─────────────────────────────────────────────────────────────────
document.getElementById('edit-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgEdit');
    const titleInput = document.getElementById('titleEdit');
    const authorInput = document.getElementById('authorEdit');
    const genreInput = document.getElementById('genreEdit');
    const num_pagesInput = document.getElementById('num_pagesEdit');
    const isbnInput = document.getElementById('isbnEdit');
    const publish_dateInput = document.getElementById('publish_dateEdit');
    const added_dateInput = document.getElementById('added_dateEdit');

    if (!titleInput.value || !authorInput.value) {
        msgDiv.innerHTML = 'Please provide a Title and Author.';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            const updatedBook = JSON.parse(xhr.response);
            const idx = data.findIndex((x) => x._id == bookIdInEdit);
            data[idx] = updatedBook;
            renderUpNextBooks(data);
            document.getElementById('close-edit-modal').click();
            msgDiv.innerHTML = '';
        } else {
            msgDiv.innerHTML = 'Something went wrong. Please try again.';
        }
    };

    xhr.open('PUT', api + '/' + bookIdInEdit, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send(JSON.stringify({
        title: titleInput.value,
        author: authorInput.value,
        genre: genreInput.value || null,
        num_pages: num_pagesInput.value ? parseInt(num_pagesInput.value) : null,
        isbn: isbnInput.value || null,
        publish_date: publish_dateInput.value || null,
        added_date: added_dateInput.value || null
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
    setAuthHeader(xhr);
    xhr.send();
}

// ── Set book in edit modal ────────────────────────────────────────────────────
function setBookInEdit(id) {
    bookIdInEdit = id;
    const book = data.find((x) => x._id == id);
    if (!book) return;

    document.getElementById('titleEdit').value = book.title || '';
    document.getElementById('authorEdit').value = book.author || '';
    document.getElementById('genreEdit').value = book.genre || '';
    document.getElementById('num_pagesEdit').value = book.num_pages || '';
    document.getElementById('isbnEdit').value = book.isbn || '';
    document.getElementById('publish_dateEdit').value = book.publish_date || '';
    document.getElementById('added_dateEdit').value = book.added_date || '';
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
        const coverHtml = book.cover_image
            ? `<img src="${book.cover_image}" alt="Cover" class="book-cover" />`
            : `<div class="book-cover-placeholder">📖</div>`;

        bookDiv.innerHTML += `
        <div id="book-${book._id}" class="book-card">
        <div class="book-cover-wrap">
                ${coverHtml}
                <button class="cover-upload-btn" onclick="uploadUpNextCover('${book._id}')">
                    📷 ${book.cover_image ? 'Change' : 'Add Cover'}
                </button>
            </div>
            <div class="book-card-content">
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
                    <button class="action-btn edit"
                        data-bs-toggle="modal"
                        data-bs-target="#modal-edit"
                        onclick="setBookInEdit('${book._id}')">
                        Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteBook('${book._id}')">
                        Delete
                    </button>
                </div>
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
        } else {
            handleAuthError(xhr.status);
        }
    };

    xhr.open('GET', api, true);
    setAuthHeader(xhr);
    xhr.send();
}

(() => { getAllBooks(); })();