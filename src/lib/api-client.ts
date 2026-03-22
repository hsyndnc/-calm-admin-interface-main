import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_GATEWAY_URL || "").endsWith('/')
    ? import.meta.env.VITE_API_GATEWAY_URL
    : `${import.meta.env.VITE_API_GATEWAY_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data instanceof Blob) {
      error.response.data.text().then((text: string) => {
        console.error("API Error:", text);
      });
    } else {
      console.error("API Error:", error.response?.data || error.message);
    }
    if (error.response?.status === 401 && !error.config.url?.includes("auth/login")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
