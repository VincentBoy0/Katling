import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true,
});

// Request interceptor: Add token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("firebase_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle token expiration (401 errors)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the Firebase token
        const { auth } = await import("@/config/firebase");
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Force refresh the token
          const newToken = await currentUser.getIdToken(true);
          localStorage.setItem("firebase_token", newToken);

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          // No user logged in, redirect to login
          localStorage.removeItem("firebase_token");
          localStorage.removeItem("katling_user");
          localStorage.removeItem("katling_roles");
          window.location.href = "/login";
        }
      } catch (refreshError) {
        // Token refresh failed, logout user
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("firebase_token");
        localStorage.removeItem("katling_user");
        localStorage.removeItem("katling_roles");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
