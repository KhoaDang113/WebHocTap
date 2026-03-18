import { createContext, useContext, useState, type ReactNode } from 'react'
import axiosClient from '../api/axiosClient'
import type { User, AuthResponse, LoginRequest, RegisterRequest, VerifyOtpRequest } from '../types'


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
                return JSON.parse(stored)
            } catch {
                localStorage.removeItem('user')
            }
        }
        return null
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const saveAuth = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        const userData: User = { username: data.username, role: data.role }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        return userData
    }

    const handleError = (err: unknown, defaultMsg: string) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || defaultMsg
        setError(msg)
        throw err
    }

    const login = async (credentials: LoginRequest): Promise<string> => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<{ message: string; email: string }>('/auth/login', credentials)
            return res.data.email
        } catch (err: unknown) {
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
            const res = await axiosClient.post<AuthResponse>('/auth/login/verify', info)
            return saveAuth(res.data)
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
            const res = await axiosClient.post<AuthResponse>('/auth/register/verify', info)
            saveAuth(res.data)
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
            const res = await axiosClient.post<AuthResponse>('/auth/oauth2/google', { idToken })
            return saveAuth(res.data)
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
