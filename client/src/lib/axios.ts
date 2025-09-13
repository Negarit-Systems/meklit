import axios from "axios";
import { config } from "./config";

// Set your API base URL here
const { BASE_URL } = config();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Simple in-memory access token store, initialized from localStorage
let accessToken: string | null = localStorage.getItem("accessToken");
if (accessToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
}

export const tokenStore = {
  get: () => {
    return localStorage.getItem("accessToken");
  },
  set: (token: string | null) => {
    accessToken = token;
    if (token) {
      localStorage.setItem("accessToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("accessToken");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  },
  clear: () => {
    accessToken = null;
    localStorage.removeItem("accessToken");
    delete apiClient.defaults.headers.common["Authorization"];
  },
};

// Attach Authorization header on every request if we have a token
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    // Don't overwrite if caller explicitly set a header
    if (!("Authorization" in config.headers)) {
      (config.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Attach a response interceptor to handle 401 and refresh token
let isRefreshing = false;
let pendingRequests: Array<(tokenRefreshed: boolean) => void> = [];

apiClient.interceptors.response.use(
  (response) => {
    // Capture access token from successful auth responses
    const url = response?.config?.url ?? "";
    const maybeToken =
      response?.data?.data?.accessToken ?? response?.data?.accessToken;
    if (
      maybeToken &&
      (url.includes("/auth/login") ||
        url.includes("/auth/verify") ||
        url.includes("/auth/refresh-token"))
    ) {
      tokenStore.set(maybeToken);
    }

    // Clear token on logout
    if (url.includes("/auth/logout")) {
      tokenStore.clear();
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    const is401 = error?.response?.status === 401;
    const requestUrl = (originalRequest?.url as string | undefined) ?? "";

    // If the 401 happened on login or refresh itself, don't try to refresh again
    const isAuthEndpoint =
      requestUrl.includes("/auth/refresh-token") ||
      requestUrl.includes("/auth/login");

    if (is401 && isAuthEndpoint) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    if (is401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until the refresh is done
        await new Promise<void>((resolve) =>
          pendingRequests.push(() => resolve())
        );
        return apiClient(originalRequest);
      }

      isRefreshing = true;
      try {
        const resp = await apiClient.post("/auth/refresh-token");
        const newToken =
          resp?.data?.data?.accessToken ?? resp?.data?.accessToken;
        if (newToken) tokenStore.set(newToken);
        pendingRequests.forEach((cb) => cb(true));
        pendingRequests = [];
        return apiClient(originalRequest);
      } catch (refreshError) {
        pendingRequests.forEach((cb) => cb(false));
        pendingRequests = [];
        tokenStore.clear();
        // Optional: redirect to sign-in or propagate error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
