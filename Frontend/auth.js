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
