// Common API response type
export interface ApiResponse<T = unknown> {
  data: T
  message: string
  success: boolean
}

// Auth types
export interface User {
  username: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  username: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
}

export interface OtpRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}
