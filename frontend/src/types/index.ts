export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  message: string
  data: T
  errors?: string[]
}

export interface LoginResponse {
  _id: string
  name: string
  email: string
  avatar?: string
  accessToken: string
}

export interface RegisterResponse {
  _id: string
  name: string
  email: string
}
