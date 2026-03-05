import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axiosClient from '../api/axiosClient'
import type { User, AuthResponse, LoginRequest, RegisterRequest, VerifyOtpRequest } from '../types'

interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => Promise<void>
    clearError: () => void
    requestRegisterOtp: (info: RegisterRequest) => Promise<void>
    verifyRegisterOtp: (info: VerifyOtpRequest) => Promise<void>
    requestLoginOtp: (email: string) => Promise<void>
    verifyLoginOtp: (info: VerifyOtpRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                localStorage.removeItem('user')
            }
        }
    }, [])

    const saveAuth = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        const userData: User = { username: data.username, role: data.role }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const handleError = (err: unknown, defaultMsg: string) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || defaultMsg
        setError(msg)
        throw err
    }

    const login = async (credentials: LoginRequest) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<AuthResponse>('/auth/login', credentials)
            saveAuth(res.data)
        } catch (err: unknown) {
            handleError(err, 'Đăng nhập thất bại')
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

    const requestLoginOtp = async (email: string) => {
        setLoading(true)
        setError(null)
        try {
            console.log(email)
            await axiosClient.post('/auth/login/request-otp', { email })
            console.log('Gửi mã OTP thành công')
        } catch (err: unknown) {
            handleError(err, 'Lỗi khi gửi mã OTP')
        } finally {
            setLoading(false)
        }
    }

    const verifyLoginOtp = async (info: VerifyOtpRequest) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axiosClient.post<AuthResponse>('/auth/login/verify', info)
            saveAuth(res.data)
        } catch (err: unknown) {
            handleError(err, 'Xác thực mã OTP thất bại')
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
            user, loading, error, login, logout, clearError,
            requestRegisterOtp, verifyRegisterOtp, requestLoginOtp, verifyLoginOtp
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
