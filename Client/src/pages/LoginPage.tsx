import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      await login({ email, password })
      navigate('/')
    } catch {
      // error handled by useAuth
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Đăng nhập</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="example@mail.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
