import env from "@/config/env"
import { api, setAccessToken } from "./axios"
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
} from "@/types/index"
import axios from "axios"

export const authApi = {
  register: async (data: any): Promise<ApiResponse<RegisterResponse>> => {
    const res = await api.post("/auth/register", data)
    return res.data
  },

  login: async (data: any): Promise<ApiResponse<LoginResponse>> => {
    const res = await api.post("/auth/login", data)
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken)
    }
    return res.data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const res = await api.post("/auth/logout")
    setAccessToken(null)
    return res.data
  },

  // Used by AuthContext on app load to check if user is already logged in via cookie
  checkSession: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    // Use raw axios to prevent interceptor loops on 401
    const res = await axios.post(
      `${env.apiBaseUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken)
    }
    return res.data
  },
}
