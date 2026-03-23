function readEnv(key: string): string {
  const value = (import.meta.env as Record<string, unknown>)[key];
  if (typeof value !== "string") return "";
  return value.trim();
}

export const API_BASE_URL =
  readEnv("VITE_API_BASE_URL") || "http://localhost:8000/api/v1";

export const APP_ORIGIN = readEnv("VITE_APP_ORIGIN") || window.location.origin;

export const OAUTH_GOOGLE_URL = `${API_BASE_URL}/auth/google`;
export const OAUTH_GITHUB_URL = `${API_BASE_URL}/auth/github`;
