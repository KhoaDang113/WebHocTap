import { useState } from 'react'
import axiosClient from '@/api/axiosClient'
import type { LoginRequest, RegisterRequest, User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const data = await axiosClient.post<User>('/auth/login', credentials)
      setUser(data as unknown as User)
      return data
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng nhập thất bại'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (info: RegisterRequest) => {
    setLoading(true)
    setError(null)
    try {
      const data = await axiosClient.post('/auth/register', info)
      return data
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng ký thất bại'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout')
      setUser(null)
    } catch {
      setUser(null)
    }
  }

  return { user, loading, error, login, register, logout }
}
