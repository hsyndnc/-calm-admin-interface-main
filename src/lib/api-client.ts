import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "").endsWith('/') 
    ? import.meta.env.VITE_API_BASE_URL 
    : `${import.meta.env.VITE_API_BASE_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error or handle globally (e.g., toast notification)
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
