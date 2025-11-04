export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 30000, // 30 seconds
} as const;

// Storage keys
export const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
} as const;

// Google OAuth Config
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Polar.sh Config
export const POLAR_CONFIG = {
  organization: import.meta.env.VITE_POLAR_ORGANIZATION || "",
  baseURL: "https://polar.sh",
} as const;
