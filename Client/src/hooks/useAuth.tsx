import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axiosClient from '../api/axiosClient'
import type { User, AuthResponse, LoginRequest, RegisterRequest, VerifyOtpRequest, ApiResponse } from '../types'

interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    login: (credentials: LoginRequest) => Promise<string>
    verifyLoginOtp: (info: VerifyOtpRequest) => Promise<User | void>
    loginWithGoogle: (idToken: string) => Promise<User | void>
    logout: () => Promise<void>
    clearError: () => void
    requestRegisterOtp: (info: RegisterRequest) => Promise<void>
    verifyRegisterOtp: (info: VerifyOtpRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (!parsed.id) {
                    localStorage.removeItem('user')
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    window.location.reload()
                    return null
                }
                return parsed
            } catch {
                localStorage.removeItem('user')
            }
        }
        return null
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch fresh user data from backend on app load to keep avatarUrl in sync with DB
    useEffect(() => {
        const refreshUserProfile = async () => {
            const token = localStorage.getItem('accessToken')
            if (!token || !user) return
            try {
                const res = await axiosClient.get<ApiResponse<{ id: string; username: string; fullName: string; role: string; avatarUrl: string; createdAt: string }>>('/auth/me')
                const data = res.data.data
                const updatedUser: User = {
                    id: data.id,
                    username: data.username,
                    fullName: data.fullName,
                    role: data.role as User['role'],
                    avatarUrl: data.avatarUrl || undefined,
                    createdAt: data.createdAt,
                }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setUser(updatedUser)
            } catch {
                // Silently fail - user can still use cached data
            }
        }
        refreshUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const saveAuth = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        const userData: User = { id: data.id, username: data.username, fullName: data.fullName, role: data.role, avatarUrl: data.avatarUrl, createdAt: data.createdAt }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        return userData
    }

    const handleError = (err: unknown, defaultMsg: string) => {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
        const msg = axiosErr?.response?.data?.message || defaultMsg
        // Nếu tài khoản bị khóa (403 Forbidden), redirect đến trang thông báo
        if (axiosErr?.response?.status === 403) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
            window.location.href = '/account-locked'
            return
        }
        setError(msg)
        throw err
    }

    const login = async (credentials: LoginRequest): Promise<string> => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<ApiResponse<{ message: string; email: string }>>('/auth/login', credentials)
            return res.data.data.email
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } }
            if (axiosErr?.response?.status === 403) {
                window.location.href = '/account-locked'
                return ''
            }
            handleError(err, 'Đăng nhập thất bại')
            return ''
        } finally {
            setLoading(false)
        }
    }

    const verifyLoginOtp = async (info: VerifyOtpRequest) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login/verify', info)
            return saveAuth(res.data.data)
        } catch (err: unknown) {
            handleError(err, 'Xác thực mã OTP thất bại')
        } finally {
            setLoading(false)
        }
    }

    const requestRegisterOtp = async (info: RegisterRequest) => {
        setLoading(true)
        setError(null)
        try {
            await axiosClient.post('/auth/register/request-otp', info)
        } catch (err: unknown) {
            handleError(err, 'Lỗi khi gửi mã OTP')
        } finally {
            setLoading(false)
        }
    }

    const verifyRegisterOtp = async (info: VerifyOtpRequest) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register/verify', info)
            saveAuth(res.data.data)
        } catch (err: unknown) {
            handleError(err, 'Xác thực mã OTP thất bại')
        } finally {
            setLoading(false)
        }
    }

    const loginWithGoogle = async (idToken: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/oauth2/google', { idToken })
            return saveAuth(res.data.data)
        } catch (err: unknown) {
            handleError(err, 'Đăng nhập với Google thất bại')
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        try {
            if (refreshToken) {
                await axiosClient.post('/auth/logout', { refreshToken })
            }
        } catch {
            // Ignore
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
        }
    }

    const clearError = () => setError(null)

    return (
        <AuthContext.Provider value={{
            user, loading, error, login, verifyLoginOtp,
            loginWithGoogle,
            logout, clearError,
            requestRegisterOtp, verifyRegisterOtp
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
