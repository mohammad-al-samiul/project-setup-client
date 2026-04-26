import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { tokenStore } from "./tokenStore";

// ==========================================================
// 🌐 BASE CONFIG
// ==========================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

// Create Axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // required for sending refresh cookie
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================================
// 🚫 DUPLICATE REQUEST PREVENTION
// ==========================================================

// Store active requests to cancel duplicates
const pending = new Map<string, AbortController>();

// Generate unique key per request
const getKey = (config: InternalAxiosRequestConfig) =>
  `${config.method}-${config.url}`;

// ==========================================================
// 📤 REQUEST INTERCEPTOR
// - Attach access token
// - Cancel duplicate requests
// ==========================================================

api.interceptors.request.use((config) => {
  /* ---------- 1. Attach Access Token ---------- */
  const token = tokenStore.get();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /* ---------- 2. Cancel Duplicate Requests ---------- */
  const key = getKey(config);

  if (pending.has(key)) {
    // Cancel previous request
    pending.get(key)?.abort();
    pending.delete(key);
  }

  // Create new AbortController
  const controller = new AbortController();
  config.signal = controller.signal;

  pending.set(key, controller);

  return config;
});

// ==========================================================
// 🔁 REFRESH TOKEN QUEUE SYSTEM
// ==========================================================

let isRefreshing = false;

// Queue for requests waiting for new token
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let queue: QueueItem[] = [];

// Process all queued requests
const processQueue = (error: unknown, token: string | null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  queue = [];
};

// ==========================================================
// 📥 RESPONSE INTERCEPTOR
// - Handle errors
// - Refresh token automatically
// - Retry failed requests
// ==========================================================

api.interceptors.response.use(
  /* ---------- SUCCESS ---------- */
  (response: AxiosResponse) => {
    // Remove request from pending map
    pending.delete(getKey(response.config));
    return response;
  },

  /* ---------- ERROR ---------- */
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Clean up pending request
    if (originalRequest) {
      pending.delete(getKey(originalRequest));
    }

    // If no request config, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ======================================================
    // 🔐 HANDLE 401 (Unauthorized)
    // ======================================================

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      /* ---------- If refresh already running ---------- */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        /* ---------- Call refresh endpoint ---------- */
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }, // cookie will be sent automatically
        );

        const newToken = (res.data as { accessToken: string }).accessToken;

        /* ---------- Save new token ---------- */
        tokenStore.set(newToken);

        /* ---------- Resolve queued requests ---------- */
        processQueue(null, newToken);

        /* ---------- Retry original request ---------- */
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        /* ---------- Refresh failed ---------- */
        processQueue(refreshError, null);
        tokenStore.clear();

        // Optional: redirect to login page
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
