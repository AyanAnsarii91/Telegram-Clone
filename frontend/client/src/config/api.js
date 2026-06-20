const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://telegram-clone-1-c1w6.onrender.com"
    : "http://localhost:5000");

export default API_URL;