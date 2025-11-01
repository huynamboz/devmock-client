import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { API_CONFIG, STORAGE_KEYS } from "@/config/api";

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// State for token refresh handling
let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management functions
function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

// Error handling
function handleError(error: AxiosError<ErrorResponse>): Error {
  if (error.response) {
    // Server responded with error
    const message =
      typeof error.response.data?.message === "string"
        ? error.response.data.message
        : Array.isArray(error.response.data?.message)
          ? error.response.data.message.join(", ")
          : error.response.data?.message || "An error occurred";

    return new Error(message);
  }

  if (error.request) {
    // Request made but no response received
    return new Error("Network error. Please check your connection.");
  }

  // Something else happened
  return new Error(error.message || "An unexpected error occurred");
}

// Token refresh
async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${API_CONFIG.baseURL}/auth/refresh`, {
    refreshToken,
  });

  return response.data;
}

// Process queued requests
function processQueue(error: unknown): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue.length = 0;
}

// Setup interceptors
function setupInterceptors(): void {
  // Request interceptor: Add access token to headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: Handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return client.request(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const token = getRefreshToken();

          if (!token) {
            throw new Error("No refresh token available");
          }

          // Try to refresh token
          const newTokens = await refreshAccessToken(token);

          setTokens(newTokens.accessToken, newTokens.refreshToken);

          // Process queued requests
          processQueue(null);

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }

          return client.request(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError);

          clearTokens();
          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(handleError(error));
    },
  );
}

// Initialize interceptors
setupInterceptors();

// API client functions
export const apiClient = {
  // Token management
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,

  // HTTP methods
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return client.get<T>(url, config);
  },

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return client.post<T>(url, data, config);
  },

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return client.put<T>(url, data, config);
  },

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return client.patch<T>(url, data, config);
  },

  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return client.delete<T>(url, config);
  },
};
