import axios from "axios";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL must be configured for production builds.");
}

const API_URL = (configuredApiUrl || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.status === 204) response.data = null;
    return response;
  },
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const requestHadToken = Boolean(localStorage.getItem("access_token"));
      if (requestHadToken) {
        redirectToLogin("Your session has expired or is invalid. Please sign in again.");
      }
    }
    return Promise.reject(error);
  }
);

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_user");
}

export function redirectToLogin(message) {
  if (typeof window === "undefined") return;
  clearStoredSession();
  window.dispatchEvent(new Event("auth:logout"));
  sessionStorage.setItem("auth_message", message);
  if (window.location.pathname !== "/login") window.location.assign("/login");
}

export function getApiError(error, fallback = "Request failed") {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return fallback;
}

export default api;
