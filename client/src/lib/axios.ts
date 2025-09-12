import axios from "axios";
import { config } from "./config";

// Set your API base URL here
const { BASE_URL } = config();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach a response interceptor to handle 401 and refresh token
let isRefreshing = false;
let pendingRequests: Array<(tokenRefreshed: boolean) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until the refresh is done
        await new Promise<void>((resolve) => pendingRequests.push(() => resolve()));
        return apiClient(originalRequest);
      }

      isRefreshing = true;
      try {
        await apiClient.post("/auth/refresh-token");
        pendingRequests.forEach((cb) => cb(true));
        pendingRequests = [];
        return apiClient(originalRequest);
      } catch (refreshError) {
        pendingRequests.forEach((cb) => cb(false));
        pendingRequests = [];
        // Optional: redirect to sign-in or propagate error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
