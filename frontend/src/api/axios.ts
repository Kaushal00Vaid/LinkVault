import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "@/config/env";
import { authTokenStore } from "@/context/authTokenStore";
import type { ApiEnvelope } from "@/types";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = authTokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiEnvelope<{ accessToken: string }>>("/auth/refresh")
      .then((res) => {
        if (!res.data.success) return null;
        return res.data?.data?.accessToken ?? null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableConfig | undefined;

    if (status !== 401 || !originalRequest) throw error;
    if (originalRequest._retry) throw error;
    if (originalRequest.url?.includes("/auth/refresh")) throw error;

    originalRequest._retry = true;

    const newToken = await refreshAccessToken();

    if (!newToken) {
      authTokenStore.clear();
      window.location.assign("/login");
      throw error;
    }

    authTokenStore.set(newToken);
    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return api.request(originalRequest);
  },
);
