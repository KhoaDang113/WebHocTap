// Common API response type
export interface ApiResponse<T = unknown> {
  data: T
  message: string
  success: boolean
}

// Auth types
export interface User {
  id: string
  email: string
  fullName?: string
  avatar?: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName?: string
}
