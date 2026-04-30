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
    document.getElementById('edit-review-text').value = book.review || '';
    document.getElementById('edit-finish-date').value = book.finishDate || '';
    document.getElementById('msgEditFinished').innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('modal-edit-finished'));
    modal.show();
}

// ── Update finished book ──────────────────────────────────────────────────────
document.getElementById('edit-finished-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msgEditFinished');
    if (!selectedEditRating) {
        msgDiv.innerHTML = 'Please select a star rating.';
        return;
    }

    const book = finishedData.find((x) => x._id == bookIdInEdit);
    if (!book) return;

    const updatedBook = {
        ...book,
        rating: selectedEditRating,
        review: document.getElementById('edit-review-text').value,
        finishDate: document.getElementById('edit-finish-date').value,
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
        container.innerHTML += `
        <div id="finished-book-${book._id}" class="book-card">
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
        }
    };
    xhr.open('GET', finishedApi, true);
    xhr.send();
}

(() => { getAllFinishedBooks(); })();