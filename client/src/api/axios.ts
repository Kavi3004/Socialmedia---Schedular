import axios from "axios";

console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const fallbackBaseURL = import.meta.env.DEV
    ? "http://localhost:3000"
    : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseURL,
    timeout: 15000,
});

export default api;