import axios from "axios";
import { useSessionStore } from "../store/sessionStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://projectt-1-g2ww.onrender.com/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
