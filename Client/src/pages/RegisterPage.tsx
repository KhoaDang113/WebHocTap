import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import type { RegisterRequest } from '@/types'

const RegisterPage = () => {
    const navigate = useNavigate()
    const { requestRegisterOtp, verifyRegisterOtp, loading, error, clearError } = useAuth()
    const [formError, setFormError] = useState<string | null>(null)

    const [isOtpStep, setIsOtpStep] = useState(false)
    const [registerInfo, setRegisterInfo] = useState<RegisterRequest | null>(null)
    const [otpCode, setOtpCode] = useState('')

    const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        clearError()
        setFormError(null)

        const form = e.currentTarget
        const username = (form.elements.namedItem('username') as HTMLInputElement).value
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value
        const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

        if (password !== confirmPassword) {
            setFormError('Mật khẩu xác nhận không khớp!')
            return
        }

        const info = { username, email, password, fullName }

        try {
            await requestRegisterOtp(info)
            setRegisterInfo(info)
            setIsOtpStep(true)
        } catch {
            // error handled by AuthContext
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!registerInfo) return

        try {
            await verifyRegisterOtp({ email: registerInfo.email, otp: otpCode })
            navigate('/') // Go to home on success
        } catch {
            // error handled by AuthContext
        }
    }

    const displayError = formError || error

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Đăng ký</h1>
                    <p className="auth-subtitle">
                        {isOtpStep ? `Nhập mã OTP vừa được gửi đến ${registerInfo?.email}` : 'Tạo tài khoản mới để bắt đầu học tập'}
                    </p>
                </div>
                {displayError && <p className="error-msg">{displayError}</p>}

                {!isOtpStep ? (
                    <form onSubmit={handleInfoSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" name="username" type="text" required placeholder="username" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fullName">Họ và tên</label>
                            <input id="fullName" name="fullName" type="text" required placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" required placeholder="example@mail.com" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" minLength={6} />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang gửi mã OTP...' : 'Đăng ký'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label htmlFor="otp">Mã OTP (6 số)</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                placeholder="123456"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading || otpCode.length < 6}>
                            {loading ? 'Đang xác thực...' : 'Xác thực & Tạo tài khoản'}
                        </button>
                        <button
                            type="button"
                            className="btn-link"
                            style={{ marginTop: '1rem', width: '100%' }}
                            onClick={() => setIsOtpStep(false)}
                            disabled={loading}
                        >
                            Quay lại
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage
