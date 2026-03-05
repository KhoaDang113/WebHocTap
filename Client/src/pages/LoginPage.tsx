import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, requestLoginOtp, verifyLoginOtp, loading, error, clearError } = useAuth()

  // UI state
  const [loginMode, setLoginMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD')
  const [isOtpSent, setIsOtpSent] = useState(false)

  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    try {
      await login({ username, password })
      navigate('/')
    } catch {
      // error handled context
    }
  }

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    try {
      await requestLoginOtp(email)
      setIsOtpSent(true)
    } catch {
      // error handled
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    try {
      await verifyLoginOtp({ email, otp: otpCode })
      navigate('/')
    } catch {
      // error handled
    }
  }

  const toggleMode = (mode: 'PASSWORD' | 'OTP') => {
    setLoginMode(mode)
    clearError()
    setIsOtpSent(false)
    setOtpCode('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng nhập</h1>
          <p className="auth-subtitle">
            {loginMode === 'PASSWORD'
              ? 'Đăng nhập để tiếp tục học tập'
              : (isOtpSent ? `Nhập mã OTP vừa được gửi đến ${email}` : 'Đăng nhập bằng mã OTP qua Email')}
          </p>
        </div>

        <div className="auth-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => toggleMode('PASSWORD')}
            style={{ flex: 1, padding: '0.5rem', background: loginMode === 'PASSWORD' ? '#eef2ff' : 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: loginMode === 'PASSWORD' ? 'bold' : 'normal', color: loginMode === 'PASSWORD' ? '#4f46e5' : '#666' }}
          >Mật khẩu</button>
          <button
            type="button"
            onClick={() => toggleMode('OTP')}
            style={{ flex: 1, padding: '0.5rem', background: loginMode === 'OTP' ? '#eef2ff' : 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: loginMode === 'OTP' ? 'bold' : 'normal', color: loginMode === 'OTP' ? '#4f46e5' : '#666' }}
          >Mã OTP</button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* PASSWORD LOGIN */}
        {loginMode === 'PASSWORD' && (
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* OTP LOGIN */}
        {loginMode === 'OTP' && !isOtpSent && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label htmlFor="email">Email đã đăng ký</label>
              <input
                id="email"
                type="email"
                required
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading || !email}>
              {loading ? 'Đang gửi mã...' : 'Nhận mã OTP'}
            </button>
          </form>
        )}

        {loginMode === 'OTP' && isOtpSent && (
          <form onSubmit={handleVerifyOtp}>
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
              onClick={() => setIsOtpSent(false)}
              disabled={loading}
            >
              Đổi Email khác
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
