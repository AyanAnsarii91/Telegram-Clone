const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    clearAuth();
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!(getToken() && getStoredUser());
}

export function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
