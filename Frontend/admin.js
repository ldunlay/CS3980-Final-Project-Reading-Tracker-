const baseApi = 'http://127.0.0.1:8000/api';

// ── Helper ────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function detailRow(label, value) {
    return `
    <div class="col-6">
        <div class="meta-label">${label}</div>
        <div class="meta-value">${value || '—'}</div>
    </div>`;
}

// ── Details modal ─────────────────────────────────────────────────────────────
function showDetails(book, type) {
    document.getElementById('details-title').textContent = book.title;

    let rows = `
        ${detailRow('Author', book.author)}
        ${detailRow('Owner', book.owner_username)}
        ${detailRow('Genre', book.genre)}
        ${detailRow('Pages', book.num_pages)}
        ${detailRow('ISBN', book.isbn)}
        ${detailRow('Published', formatDate(book.publish_date))}
    `;

    if (type === 'current') {
        rows += `
        ${detailRow('Started', formatDate(book.startDate))}
        ${detailRow('Current Page', book.current_page)}
        `;
    } else if (type === 'finished') {
        rows += `
        ${detailRow('Started', formatDate(book.startDate))}
        ${detailRow('Finished', formatDate(book.finishDate))}
        ${detailRow('Rating', book.rating ? '★'.repeat(book.rating) : '—')}
        `;
        if (book.review) {
            rows += `
            <div class="col-12">
                <div class="meta-label">Review</div>
                <div class="meta-value">${book.review}</div>
            </div>`;
        }
    } else if (type === 'upnext') {
        rows += detailRow('Date Added', formatDate(book.added_date));
    }

    if (book.cover_image) {
        rows += `
        <div class="col-12 mt-2">
            <div class="meta-label">Cover</div>
            <img src="${book.cover_image}" alt="Cover" style="max-height:180px;border-radius:6px;margin-top:0.4rem;" />
        </div>`;
    }

    document.getElementById('details-body').innerHTML = rows;
    new bootstrap.Modal(document.getElementById('modal-details')).show();
}

// ── Filter helper: get unique sorted values ───────────────────────────────────
function getUniqueValues(arr, key) {
    return [...new Set(arr.map(x => x[key]).filter(Boolean))].sort();
}

function buildOwnerFilter(id, arr, onchange) {
    const owners = getUniqueValues(arr, 'owner_username');
    return `
    <select id="${id}" class="form-select form-select-sm d-inline-block w-auto mb-2" onchange="${onchange}">
        <option value="">All Owners</option>
        ${owners.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select>`;
}

// ── Users ─────────────────────────────────────────────────────────────────────
let allUsers = [];

function loadUsers() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 403) {
            document.querySelector('.main').innerHTML = '<p class="text-danger mt-4">Access denied. Admins only.</p>';
            return;
        }
        allUsers = JSON.parse(xhr.response) || [];
        renderUsers(allUsers);
    };
    xhr.open('GET', baseApi + '/users/admin/users', true);
    setAuthHeader(xhr);
    xhr.send();
}

function renderUsers(users) {
    const roles = getUniqueValues(allUsers, 'role');
    const roleFilter = document.getElementById('user-role-filter')?.value || '';

    document.getElementById('user-filters').innerHTML = `
        <select id="user-role-filter" class="form-select form-select-sm d-inline-block w-auto mb-2"
            onchange="renderUsers(allUsers)">
            <option value="">All Roles</option>
            ${roles.map(r => `<option value="${r}" ${roleFilter === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>`;

    const filtered = roleFilter ? users.filter(u => u.role === roleFilter) : users;
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    filtered.forEach(u => {
        tbody.innerHTML += `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}')">Delete</button>
            </td>
        </tr>`;
    });
}

function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => { if (xhr.status === 200) loadUsers(); };
    xhr.open('DELETE', baseApi + '/users/admin/users/' + id, true);
    setAuthHeader(xhr);
    xhr.send();
}

// ── Current Books ─────────────────────────────────────────────────────────────
let allCurrentBooks = [];

function loadCurrentBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        allCurrentBooks = JSON.parse(xhr.response) || [];
        renderCurrentBooks(allCurrentBooks);
    };
    xhr.open('GET', baseApi + '/current-books/admin/all', true);
    setAuthHeader(xhr);
    xhr.send();
}

function renderCurrentBooks(books) {
    const ownerFilter = document.getElementById('current-owner-filter')?.value || '';
    const owners = getUniqueValues(allCurrentBooks, 'owner_username');

    document.getElementById('current-filters').innerHTML = `
        <select id="current-owner-filter" class="form-select form-select-sm d-inline-block w-auto mb-2"
            onchange="renderCurrentBooks(allCurrentBooks)">
            <option value="">All Owners</option>
            ${owners.map(o => `<option value="${o}" ${ownerFilter === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>`;

    const filtered = ownerFilter ? books.filter(b => b.owner_username === ownerFilter) : books;
    const tbody = document.getElementById('current-tbody');
    tbody.innerHTML = '';
    filtered.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.owner_username}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="showDetails(allCurrentBooks.find(x=>x._id=='${b._id}'), 'current')">Details</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCurrentBook('${b._id}')">Delete</button>
            </td>
        </tr>`;
    });
}

function deleteCurrentBook(id) {
    if (!confirm('Delete this book?')) return;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => { if (xhr.status === 200) loadCurrentBooks(); };
    xhr.open('DELETE', baseApi + '/current-books/admin/' + id, true);
    setAuthHeader(xhr);
    xhr.send();
}

// ── Finished Books ────────────────────────────────────────────────────────────
let allFinishedBooks = [];

function loadFinishedBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        allFinishedBooks = JSON.parse(xhr.response) || [];
        renderFinishedBooks(allFinishedBooks);
    };
    xhr.open('GET', baseApi + '/finished-books/admin/all', true);
    setAuthHeader(xhr);
    xhr.send();
}

function renderFinishedBooks(books) {
    const ownerFilter = document.getElementById('finished-owner-filter')?.value || '';
    const ratingFilter = document.getElementById('finished-rating-filter')?.value || '';
    const owners = getUniqueValues(allFinishedBooks, 'owner_username');

    document.getElementById('finished-filters').innerHTML = `
        <select id="finished-owner-filter" class="form-select form-select-sm d-inline-block w-auto mb-2 me-2"
            onchange="renderFinishedBooks(allFinishedBooks)">
            <option value="">All Owners</option>
            ${owners.map(o => `<option value="${o}" ${ownerFilter === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
        <select id="finished-rating-filter" class="form-select form-select-sm d-inline-block w-auto mb-2"
            onchange="renderFinishedBooks(allFinishedBooks)">
            <option value="">All Ratings</option>
            <option value="5" ${ratingFilter === '5' ? 'selected' : ''}>★★★★★ (5)</option>
            <option value="4" ${ratingFilter === '4' ? 'selected' : ''}>★★★★ (4)</option>
            <option value="3" ${ratingFilter === '3' ? 'selected' : ''}>★★★ (3)</option>
            <option value="2" ${ratingFilter === '2' ? 'selected' : ''}>★★ (2)</option>
            <option value="1" ${ratingFilter === '1' ? 'selected' : ''}>★ (1)</option>
        </select>`;

    let filtered = books;
    if (ownerFilter) filtered = filtered.filter(b => b.owner_username === ownerFilter);
    if (ratingFilter) filtered = filtered.filter(b => b.rating === parseInt(ratingFilter));

    const tbody = document.getElementById('finished-tbody');
    tbody.innerHTML = '';
    filtered.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.owner_username}</td>
            <td>${'★'.repeat(b.rating || 0)}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="showDetails(allFinishedBooks.find(x=>x._id=='${b._id}'), 'finished')">Details</button>
                <button class="btn btn-sm btn-danger" onclick="deleteFinishedBook('${b._id}')">Delete</button>
            </td>
        </tr>`;
    });
}

function deleteFinishedBook(id) {
    if (!confirm('Delete this book?')) return;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => { if (xhr.status === 200) loadFinishedBooks(); };
    xhr.open('DELETE', baseApi + '/finished-books/admin/' + id, true);
    setAuthHeader(xhr);
    xhr.send();
}

// ── Up Next Books ─────────────────────────────────────────────────────────────
let allUpNextBooks = [];

function loadUpNextBooks() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        allUpNextBooks = JSON.parse(xhr.response) || [];
        renderUpNextBooks(allUpNextBooks);
    };
    xhr.open('GET', baseApi + '/up-next/admin/all', true);
    setAuthHeader(xhr);
    xhr.send();
}

function renderUpNextBooks(books) {
    const ownerFilter = document.getElementById('upnext-owner-filter')?.value || '';
    const owners = getUniqueValues(allUpNextBooks, 'owner_username');

    document.getElementById('upnext-filters').innerHTML = `
        <select id="upnext-owner-filter" class="form-select form-select-sm d-inline-block w-auto mb-2"
            onchange="renderUpNextBooks(allUpNextBooks)">
            <option value="">All Owners</option>
            ${owners.map(o => `<option value="${o}" ${ownerFilter === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>`;

    const filtered = ownerFilter ? books.filter(b => b.owner_username === ownerFilter) : books;
    const tbody = document.getElementById('upnext-tbody');
    tbody.innerHTML = '';
    filtered.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.owner_username}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="showDetails(allUpNextBooks.find(x=>x._id=='${b._id}'), 'upnext')">Details</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUpNextBook('${b._id}')">Delete</button>
            </td>
        </tr>`;
    });
}

function deleteUpNextBook(id) {
    if (!confirm('Delete this book?')) return;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => { if (xhr.status === 200) loadUpNextBooks(); };
    xhr.open('DELETE', baseApi + '/up-next/admin/' + id, true);
    setAuthHeader(xhr);
    xhr.send();
}

// ── Load everything on page load ──────────────────────────────────────────────
(() => {
    loadUsers();
    loadCurrentBooks();
    loadFinishedBooks();
    loadUpNextBooks();
})();