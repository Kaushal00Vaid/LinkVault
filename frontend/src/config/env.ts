const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] || fallback

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const env = {
  apiBaseUrl: getEnv("VITE_API_BASE_URL", "http://localhost:8000/api/v1"),
} as const

export default env
