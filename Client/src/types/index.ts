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

// User management
export interface UserDTO {
  id: string
  username: string
  email: string
  fullName: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  createdAt: string
  updatedAt: string
  isBlocked?: boolean
}

// Course management
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface CourseDTO {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  price: number
  categoryId: string
  instructor?: string
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

export interface CategoryDTO {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CoursePayload {
  title: string
  description: string
  thumbnailUrl: string
  price: number
  categoryId: string
  instructor?: string
  status: CourseStatus
}

// Lesson management
export interface LessonDTO {
  id: string
  courseId: string
  title: string
  content: string
  orderIndex: number
  videoUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface LessonPayload {
  courseId: string
  title: string
  content: string
  orderIndex: number
  videoUrl?: string
  imageUrl?: string
}
