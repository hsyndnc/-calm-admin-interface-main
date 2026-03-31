import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_GATEWAY_URL || "").endsWith('/')
    ? import.meta.env.VITE_API_GATEWAY_URL
    : `${import.meta.env.VITE_API_GATEWAY_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Bearer token (auth routes hariç)
apiClient.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthRoute = url.includes("/auth/") || url.startsWith("auth/");
  if (!isAuthRoute) {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
let isRedirectingTo401 = false;

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

    const url = error.config?.url || "";
    const isAuthRoute = url.includes("auth/login") || url.includes("auth/register");

    if (error.response?.status === 401 && !isAuthRoute && !isRedirectingTo401) {
      const token = localStorage.getItem("token");
      if (token) {
        isRedirectingTo401 = true;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
