import { STORAGE_KEYS } from "./constants";

export const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN) || "";
export const setStoredToken = (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token);
export const removeStoredToken = () => localStorage.removeItem(STORAGE_KEYS.TOKEN);

export const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem(STORAGE_KEYS.USER);

export const clearAuthStorage = () => {
  removeStoredToken();
  removeStoredUser();
};