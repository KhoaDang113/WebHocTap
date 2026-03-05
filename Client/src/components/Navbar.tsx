import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import './Navbar.css'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const getRoleBadge = (role: string) => {
        const labels: Record<string, string> = {
            ADMIN: 'Admin',
            TEACHER: 'Giảng viên',
            STUDENT: 'Học viên',
        }
        return labels[role] || role
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">📚</span>
                    <span className="brand-text">WebHocTap</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Trang chủ
                    </Link>
                </div>

                <div className="navbar-auth">
                    {user ? (
                        <>
                            <div className="user-info">
                                <span className="user-name">{user.username}</span>
                                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                    {getRoleBadge(user.role)}
                                </span>
                            </div>
                            <button className="btn btn-logout" onClick={handleLogout}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-login">
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="btn btn-register">
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>

                <button className="navbar-toggle" id="navbar-toggle" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    )
}

export default Navbar
