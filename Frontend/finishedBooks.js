const finishedApi = 'http://127.0.0.1:8000/api/finished-books';

let finishedData = [];
let bookIdInEdit = 0;
let selectedEditRating = 0;

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span style="color:${i <= rating ? '#f5a623' : '#ccc'};font-size:1.1rem;">&#9733;</span>`;
    }
    return html;
}

// ── Upload cover image ────────────────────────────────────────────────────────
function uploadFinishedCover(bookId) {
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
                const book = finishedData.find(x => x._id == bookId);
                if (book) book.cover_image = updated.cover_image;
                renderFinishedBooks(finishedData);
            } else {
                alert('Failed to upload cover image.');
            }
        };
        xhr.open('POST', finishedApi + '/' + bookId + '/cover', true);
        setAuthHeader(xhr);
        xhr.send(formData);
    };
    input.click();
}

// ── Star rating logic for edit modal ─────────────────────────────────────────
document.getElementById('star-rating-edit').addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('star')) highlightEditStars(parseInt(e.target.dataset.value));
});
document.getElementById('star-rating-edit').addEventListener('mouseout', () => {
    highlightEditStars(selectedEditRating);
});
document.getElementById('star-rating-edit').addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
        selectedEditRating = parseInt(e.target.dataset.value);
        highlightEditStars(selectedEditRating);
    }
});

// ── Star rating logic for add modal ──────────────────────────────────────────
let selectedAddRating = 0;

document.getElementById('star-rating-add').addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('star')) highlightAddStars(parseInt(e.target.dataset.value));
});
document.getElementById('star-rating-add').addEventListener('mouseout', () => {
    highlightAddStars(selectedAddRating);
});
document.getElementById('star-rating-add').addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
        selectedAddRating = parseInt(e.target.dataset.value);
        highlightAddStars(selectedAddRating);
    }
});

function highlightAddStars(count) {
    document.querySelectorAll('#star-rating-add .star').forEach((star) => {
        star.style.color = parseInt(star.dataset.value) <= count ? '#f5a623' : '#ccc';
    });
}

// ── Add finished book ─────────────────────────────────────────────────────────
document.getElementById('add-finished-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgAdd');
    const titleInput = document.getElementById('add-title');
    const authorInput = document.getElementById('add-author');
    const startDateInput = document.getElementById('add-start-date');
    const finishDateInput = document.getElementById('add-finish-date');

    if (!titleInput.value || !authorInput.value || !startDateInput.value || !finishDateInput.value) {
        msgDiv.innerHTML = 'Please provide a Title, Author, Start Date, and Finish Date.';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newBook = JSON.parse(xhr.response);
            finishedData.push(newBook);
            renderFinishedBooks(finishedData);
            document.getElementById('close-add-finished-modal').click();

            // Reset form
            titleInput.value = '';
            authorInput.value = '';
            document.getElementById('add-genre').value = '';
            document.getElementById('add-num-pages').value = '';
            document.getElementById('add-isbn').value = '';
            document.getElementById('add-publish-date').value = '';
            document.getElementById('add-start-date').value = '';
            document.getElementById('add-finish-date').value = '';
            document.getElementById('add-review').value = '';
            selectedAddRating = 0;
            highlightAddStars(0);
            msgDiv.innerHTML = '';
        } else {
            msgDiv.innerHTML = 'Something went wrong. Please try again.';
        }
    };

    xhr.open('POST', finishedApi, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send(JSON.stringify({
        title: titleInput.value,
        author: authorInput.value,
        genre: document.getElementById('add-genre').value || null,
        num_pages: document.getElementById('add-num-pages').value ? parseInt(document.getElementById('add-num-pages').value) : null,
        isbn: document.getElementById('add-isbn').value || null,
        publish_date: document.getElementById('add-publish-date').value || null,
        startDate: document.getElementById('add-start-date').value || null,
        finishDate: document.getElementById('add-finish-date').value || null,
        rating: selectedAddRating || null,
        review: document.getElementById('add-review').value || null,
    }));
});

function highlightEditStars(count) {
    document.querySelectorAll('#star-rating-edit .star').forEach((star) => {
        star.style.color = parseInt(star.dataset.value) <= count ? '#f5a623' : '#ccc';
    });
}

// ── Open edit modal ───────────────────────────────────────────────────────────
function openEditFinishedModal(id) {
    bookIdInEdit = id;
    const book = finishedData.find((x) => x._id == id);
    if (!book) return;

    selectedEditRating = book.rating || 0;
    highlightEditStars(selectedEditRating);

    document.getElementById('edit-title').value = book.title || '';
    document.getElementById('edit-author').value = book.author || '';
    document.getElementById('edit-genre').value = book.genre || '';
    document.getElementById('edit-num-pages').value = book.num_pages || '';
    document.getElementById('edit-isbn').value = book.isbn || '';
    document.getElementById('edit-publish-date').value = book.publish_date || '';
    document.getElementById('edit-start-date').value = book.startDate || '';
    document.getElementById('edit-finish-date').value = book.finishDate || '';
    document.getElementById('edit-review-text').value = book.review || '';
    document.getElementById('msgEditFinished').innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('modal-edit-finished'));
    modal.show();
}

// ── Update finished book ──────────────────────────────────────────────────────
document.getElementById('edit-finished-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgEditFinished');
    const titleVal = document.getElementById('edit-title').value;
    const authorVal = document.getElementById('edit-author').value;
    const startDateVal = document.getElementById('edit-start-date').value;
    const finishDateVal = document.getElementById('edit-finish-date').value;

    if (!titleVal || !authorVal || !startDateVal || !finishDateVal) {
        msgDiv.innerHTML = 'Please provide a Title, Author, Start Date, and Finish Date.';
        return;
    }

    const book = finishedData.find((x) => x._id == bookIdInEdit);
    if (!book) return;

    const updatedBook = {
        title: titleVal,
        author: authorVal,
        genre: document.getElementById('edit-genre').value || null,
        num_pages: document.getElementById('edit-num-pages').value ? parseInt(document.getElementById('edit-num-pages').value) : null,
        isbn: document.getElementById('edit-isbn').value || null,
        publish_date: document.getElementById('edit-publish-date').value || null,
        startDate: startDateVal,
        finishDate: finishDateVal,
        rating: selectedEditRating || null,
        review: document.getElementById('edit-review-text').value || null,
    };

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            const returned = JSON.parse(xhr.response);
            const idx = finishedData.findIndex((x) => x._id == bookIdInEdit);
            finishedData[idx] = returned;
            renderFinishedBooks(finishedData);
            document.getElementById('close-edit-finished-modal').click();
        } else {
            msgDiv.innerHTML = 'Something went wrong. Please try again.';
        }
    };

    xhr.open('PUT', finishedApi + '/' + bookIdInEdit, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send(JSON.stringify(updatedBook));
});

// ── Delete finished book ──────────────────────────────────────────────────────
function deleteFinishedBook(id) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            finishedData = finishedData.filter((x) => x._id != id);
            renderFinishedBooks(finishedData);
        }
    };
    xhr.open('DELETE', finishedApi + '/' + id, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    setAuthHeader(xhr);
    xhr.send();
}

// ── Render finished books ─────────────────────────────────────────────────────
function renderFinishedBooks(data) {
    data.sort((a, b) => new Date(b.finishDate) - new Date(a.finishDate));
    const container = document.getElementById('finished-books');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <p>No finished books yet. Keep reading!</p>
            </div>`;
        return;
    }

    data.forEach(book => {
        const coverHtml = book.cover_image
            ? `<img src="${book.cover_image}" alt="Cover" class="book-cover" />`
            : `<div class="book-cover-placeholder">📖</div>`;

        container.innerHTML += `
        <div id="finished-book-${book._id}" class="book-card">
            <div class="book-cover-wrap">
                ${coverHtml}
                <button class="cover-upload-btn" onclick="uploadFinishedCover('${book._id}')">
                    📷 ${book.cover_image ? 'Change Cover' : 'Add Cover'}
                </button>
            </div>
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
                    <span class="meta-label">Started</span>
                    <span class="meta-value">${formatDate(book.startDate)}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Finished</span>
                    <span class="meta-value">${formatDate(book.finishDate)}</span>
                </div>
                <div class="book-meta-row">
                    <span class="meta-label">Rating</span>
                    <span class="meta-value">${renderStars(book.rating)}</span>
                </div>
                ${book.review ? `
                <div class="book-meta-row">
                    <span class="meta-label">Review</span>
                    <span class="meta-value">${book.review}</span>
                </div>` : ''}
            </div>
            <div class="book-actions">
                <button class="action-btn edit" onclick="openEditFinishedModal('${book._id}')">
                    Edit Review
                </button>
                <button class="action-btn delete" onclick="deleteFinishedBook('${book._id}')">
                    Delete
                </button>
            </div>
        </div>`;
    });
}

// ── Fetch all finished books on load ─────────────────────────────────────────
function getAllFinishedBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            finishedData = JSON.parse(xhr.response) || [];
            renderFinishedBooks(finishedData);
        } else {
            handleAuthError(xhr.status);
        }
    };
    xhr.open('GET', finishedApi, true);
    setAuthHeader(xhr);
    xhr.send();
}

(() => { getAllFinishedBooks(); })();