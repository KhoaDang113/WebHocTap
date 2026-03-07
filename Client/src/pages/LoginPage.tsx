import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; width?: number; text?: string; shape?: string; logo_alignment?: string }) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, verifyLoginOtp, loginWithGoogle, loading, error, clearError } = useAuth()

  // UI state
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Google Sign-In callback
  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    clearError()
    try {
      await loginWithGoogle(response.credential)
      navigate('/')
    } catch {
      // error handled
    }
  }, [loginWithGoogle, navigate, clearError])

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      }
    }

    // Try immediately, or wait for script to load
    if (window.google) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle()
          clearInterval(interval)
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [handleGoogleCallback])

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    try {
      const email = await login({ username, password })
      setUserEmail(email)
      setIsOtpStep(true)
    } catch {
      // error handled context
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    try {
      await verifyLoginOtp({ email: userEmail, otp: otpCode })
      navigate('/')
    } catch {
      // error handled context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng nhập</h1>
          <p className="auth-subtitle">
            {isOtpStep
              ? `Nhập mã OTP vừa được gửi đến ${userEmail}`
              : 'Đăng nhập để tiếp tục học tập'}
          </p>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {!isOtpStep ? (
          <>
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              <span style={{ color: '#999', fontSize: '0.85rem' }}>hoặc đăng nhập với</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            {/* Social Login Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              {/* Google Sign-In Button */}
              <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
            </div>
          </>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otpCode">Mã OTP (6 số)</label>
              <input
                id="otpCode"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading || otpCode.length < 6}>
              {loading ? 'Đang xác thực...' : 'Xác thực & Đăng nhập'}
            </button>
            <button
              type="button"
              className="btn-link"
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => { setIsOtpStep(false); setOtpCode(''); clearError() }}
              disabled={loading}
            >
              ← Quay lại
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
