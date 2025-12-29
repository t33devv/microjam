const STORAGE_KEY = 'microjam_auth_token';

const isBrowser = () => typeof window !== 'undefined';

const saveAuthToken = (token) => {
  if (!isBrowser() || !token) return;

  window.localStorage.setItem(STORAGE_KEY, token);
};

const getAuthToken = () => {
  if (!isBrowser()) return null;

  return window.localStorage.getItem(STORAGE_KEY);
};

const clearAuthToken = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(STORAGE_KEY);
};

export { STORAGE_KEY, saveAuthToken, getAuthToken, clearAuthToken };
