function getStoredUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

function redirectToSignin() {
    localStorage.removeItem('user');
    window.location.href = 'signin.html';
}

function requireSignedInUser() {
    const user = getStoredUser();
    if (!user.access_token) {
        redirectToSignin();
        return null;
    }
    return user;
}

function setAuthHeader(xhr) {
    const user = requireSignedInUser();
    if (user) {
        xhr.setRequestHeader('Authorization', `Bearer ${user.access_token}`);
    }
}

function getAuthHeaders(extraHeaders = {}) {
    const user = requireSignedInUser();
    if (!user) return extraHeaders;
    return {
        ...extraHeaders,
        Authorization: `Bearer ${user.access_token}`,
    };
}

function handleAuthError(status) {
    if (status === 401 || status === 403) {
        redirectToSignin();
    }
}

function isAdmin() {
    const user = getStoredUser();
    return user.role === 'Admin';
}

function requireAdmin() {
    const user = requireSignedInUser();
    if (!user) return;
    if (user.role !== 'Admin') {
        window.location.href = 'index.html';
    }
}

function applyAdminUI() {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(el => {
        if (isAdmin()) {
            el.style.display = '';
        } else {
            el.remove();
        }
    });
}