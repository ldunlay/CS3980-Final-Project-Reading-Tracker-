const api = 'http://127.0.0.1:8000/api/current-books';
const finishedApi = 'http://127.0.0.1:8000/api/finished-books';

let data = [];
let bookIdInEdit = 0;
let bookIdToFinish = 0;
let selectedRating = 0;

// helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Star rating logic ─────────────────────────────────────────────────────────
document.getElementById('star-rating').addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('star')) {
        highlightStars(parseInt(e.target.dataset.value));
    }
});

document.getElementById('star-rating').addEventListener('mouseout', () => {
    highlightStars(selectedRating);
});

document.getElementById('star-rating').addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
        selectedRating = parseInt(e.target.dataset.value);
        highlightStars(selectedRating);
    }
});

function highlightStars(count) {
    document.querySelectorAll('#star-rating .star').forEach((star) => {
        star.style.color = parseInt(star.dataset.value) <= count ? '#f5a623' : '#ccc';
    });
}

// ── Open finish modal ─────────────────────────────────────────────────────────
function openFinishModal(id) {
    bookIdToFinish = id;
    selectedRating = 0;
    highlightStars(0);

    const book = data.find((x) => x._id == id);
    if (!book) return;

    document.getElementById('finish-book-title').textContent = book.title;
    document.getElementById('finish-review').value = '';
    document.getElementById('finish-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('msgFinish').innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('modal-finish'));
    modal.show();
}

// ── Mark as finished ──────────────────────────────────────────────────────────
document.getElementById('finish-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgFinish');

    if (!selectedRating) {
        msgDiv.innerHTML = 'Please select a star rating before finishing.';
        return;
    }

    const book = data.find((x) => x._id == bookIdToFinish);
    if (!book) return;

    const finishedBook = {
        title: book.title,
        genre: book.genre,
        author: book.author,
        num_pages: book.num_pages,
        isbn: book.isbn,
        publish_date: book.publish_date,
        startDate: book.startDate,
        finishDate: document.getElementById('finish-date').value,
        rating: selectedRating,
        review: document.getElementById('finish-review').value,
    };

    const xhrPost = new XMLHttpRequest();
    xhrPost.onload = () => {
        if (xhrPost.status === 201) {
            const xhrDelete = new XMLHttpRequest();
            xhrDelete.onload = () => {
                if (xhrDelete.status === 200) {
                    data = data.filter((x) => x._id != bookIdToFinish);
                    renderCurrentBooks(data);
                    document.getElementById('close-finish-modal').click();
                }
            };
            xhrDelete.open('DELETE', api + '/' + bookIdToFinish, true);
            xhrDelete.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            setAuthHeader(xhrDelete);
            xhrDelete.send();
        } else {
            msgDiv.innerHTML = 'Something went wrong saving to Finished Books. Please try again.';
        }
    };

    xhrPost.open('POST', finishedApi, true);
    xhrPost.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhrPost);
    xhrPost.send(JSON.stringify(finishedBook));
});

// ── Download ──────────────────────────────────────────────────────────────────
document.getElementById('download-btn').addEventListener('click', () => {
    fetch(api + '/download', {
        headers: getAuthHeaders(),
    }).then((response) => {
        handleAuthError(response.status);
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
    }).then((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'current_books.json';
        link.click();
        URL.revokeObjectURL(downloadUrl);
    }).catch(() => {
        alert('Unable to download your current books.');
    });
});
// -- Upload ───────────────────────────────────────────────────────────────────
document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('upload-file').click();
});

document.getElementById('upload-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        let uploadedBooks;

        try {
            uploadedBooks = JSON.parse(reader.result);
        } catch {
            alert('Please upload a valid JSON file.');
            e.target.value = '';
            return;
        }

        if (!Array.isArray(uploadedBooks)) {
            alert('The uploaded file must contain a list of books.');
            e.target.value = '';
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status === 201) {
                const importedBooks = JSON.parse(xhr.response) || [];
                data = data.concat(importedBooks);
                renderCurrentBooks(data);
            } else {
                alert('Unable to upload this book list. Please check the file format.');
            }

            e.target.value = '';
        };

        xhr.open('POST', api + '/upload', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        setAuthHeader(xhr);
        xhr.send(JSON.stringify(uploadedBooks));
    };

    reader.onerror = () => {
        alert('Unable to read the selected file.');
        e.target.value = '';
    };

    reader.readAsText(file);
});

// ── Add book ──────────────────────────────────────────────────────────────────
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
    const current_pageInput = document.getElementById('current_page');

    if (!titleInput.value || !authorInput.value || !startDateInput.value) {
        msgDiv.innerHTML = 'Please provide a Title, Author, and Start Date.';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newCurrentBook = JSON.parse(xhr.response);
            data.push(newCurrentBook);
            renderCurrentBooks(data);

            document.getElementById('close-add-modal').click();

            msgDiv.innerHTML = '';
            titleInput.value = '';
            genreInput.value = '';
            authorInput.value = '';
            startDateInput.value = '';
            num_pagesInput.value = '';
            isbnInput.value = '';
            publish_dateInput.value = '';
            current_pageInput.value = '';
        }
    };

    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send(JSON.stringify({
        title: titleInput.value,
        genre: genreInput.value || null,
        author: authorInput.value,
        startDate: startDateInput.value,
        publish_date: publish_dateInput.value || null,
        isbn: isbnInput.value || null,
        num_pages: num_pagesInput.value ? parseInt(num_pagesInput.value) : null,
        current_page: current_pageInput.value ? parseInt(current_pageInput.value) : null
    }));
});

// ── Edit book ─────────────────────────────────────────────────────────────────
document.getElementById('edit-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgEdit');
    const titleInput = document.getElementById('titleEdit');
    const genreInput = document.getElementById('genreEdit');
    const authorInput = document.getElementById('authorEdit');
    const startDateInput = document.getElementById('startDateEdit');
    const num_pagesInput = document.getElementById('num_pagesEdit');
    const isbnInput = document.getElementById('isbnEdit');
    const publish_dateInput = document.getElementById('publish_dateEdit');
    const current_pageInput = document.getElementById('current_pageEdit');

    if (!titleInput.value || !authorInput.value || !startDateInput.value) {
        msgDiv.innerHTML = 'Please provide a Title, Author, and Start Date.';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            const newBook = JSON.parse(xhr.response);
            const book = data.find((x) => x._id == bookIdInEdit);
            book.title = newBook.title;
            book.genre = newBook.genre;
            book.author = newBook.author;
            book.startDate = newBook.startDate;
            book.current_page = newBook.current_page;
            renderCurrentBooks(data);

            document.getElementById('close-edit-modal').click();

            msgDiv.innerHTML = '';
            titleInput.value = '';
            genreInput.value = '';
            authorInput.value = '';
            startDateInput.value = '';
            current_pageInput.value = '';
        }
    };

    xhr.open('PUT', api + '/' + bookIdInEdit, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send(JSON.stringify({
        title: titleInput.value,
        genre: genreInput.value || null,
        author: authorInput.value,
        startDate: startDateInput.value,
        publish_date: publish_dateInput.value || null,
        isbn: isbnInput.value || null,
        num_pages: num_pagesInput.value ? parseInt(num_pagesInput.value) : null,
        current_page: current_pageInput.value ? parseInt(current_pageInput.value) : null
    }));
});

// ── Delete book ───────────────────────────────────────────────────────────────
function deleteBook(id) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = data.filter((x) => x._id != id);
            renderCurrentBooks(data);
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
    document.getElementById('genreEdit').value = book.genre || '';
    document.getElementById('authorEdit').value = book.author || '';
    document.getElementById('startDateEdit').value = book.startDate || '';
    document.getElementById('num_pagesEdit').value = book.num_pages || '';
    document.getElementById('isbnEdit').value = book.isbn || '';
    document.getElementById('publish_dateEdit').value = book.publish_date || '';
    document.getElementById('current_pageEdit').value = book.current_page || '';
}

// ── Upload cover image ────────────────────────────────────────────────────────
function uploadCover(bookId) {
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
                renderCurrentBooks(data);
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

function renderCurrentBooks(data) {
    data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const bookDiv = document.getElementById('books');
    bookDiv.innerHTML = '';

    if (data.length === 0) {
        bookDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <p>No books currently being read. Add one to get started!</p>
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
                <button class="cover-upload-btn" onclick="uploadCover('${book._id}')">
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
                        <span class="meta-label">Started</span>
                        <span class="meta-value">${formatDate(book.startDate)}</span>
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
                    <button class="action-btn finish" onclick="openFinishModal('${book._id}')">
                        Mark as Finished
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
            renderCurrentBooks(data);
        } else {
            handleAuthError(xhr.status);
        }
    };
    xhr.open('GET', api, true);
    setAuthHeader(xhr);
    xhr.send();
}

(() => { getAllBooks(); })();
