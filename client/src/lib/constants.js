export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const STORAGE_KEYS = {
  TOKEN: "nextalk_token",
  USER: "nextalk_user"
};

export const CHAT_TYPES = {
  DM: "dm",
  ROOM: "room"
};