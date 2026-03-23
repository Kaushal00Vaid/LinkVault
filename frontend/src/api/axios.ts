import axios from "axios"
import env from "@/config/env"

const BASE_URL = env.apiBaseUrl

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // httpOnly cookie
})

// In-memory token storage
let currentAccessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token
}

// Request Interceptor: Attach token if we have it
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Silent Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Do not intercept if the request is already trying to refresh
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error)
    }

    // If 401 and we haven't already retried this exact request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt silent refresh
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = refreshResponse.data.data.accessToken
        setAccessToken(newAccessToken)

        // Update original request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - clear state
        setAccessToken(null)

        // Dispatch custom event so AuthContext can log user out
        window.dispatchEvent(new Event("auth:unauthorized"))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
