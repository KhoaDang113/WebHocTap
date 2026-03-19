import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { LogIn, UserPlus, LogOut, User, Key, ChevronDown, Menu } from 'lucide-react'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await logout()
        setIsDropdownOpen(false)
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

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN': return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            case 'TEACHER': return 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            case 'STUDENT': return 'bg-green-100 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
            default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
        }
    }

    const displayName = user?.username?.split('@')[0] || ''

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f0f19]/85 backdrop-blur-md border-b border-indigo-500/15 shadow-sm">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-16">
                <Link to="/" className="flex items-center gap-2 no-underline text-slate-800 dark:text-white font-bold text-xl tracking-tight transition-opacity hover:opacity-85">
                    <span className="text-2xl flex items-center">📚</span>
                    <span className="bg-gradient-to-br from-indigo-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        WebHocTap
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    <Link
                        to="/"
                        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            location.pathname === '/' 
                            ? 'text-purple-600 dark:text-purple-400 bg-slate-50 dark:bg-white/5' 
                            : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5'
                        }`}
                    >
                        Trang chủ
                        {location.pathname === '/' && (
                            <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-sm" />
                        )}
                    </Link>
                    <Link
                        to="/courses"
                        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            location.pathname === '/courses' 
                            ? 'text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-white/5' 
                            : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5'
                        }`}
                    >
                        Khóa học
                        {location.pathname === '/courses' && (
                            <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-sm" />
                        )}
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 p-1.5 pl-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white/90 leading-tight">
                                        {displayName}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded-md uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                                        {getRoleBadge(user.role)}
                                    </span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{displayName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.username}</p>
                                    </div>
                                    
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={16} />
                                        Hồ sơ cá nhân
                                    </Link>
                                    
                                    <Link 
                                        to="/change-password" 
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Key size={16} />
                                        Đổi mật khẩu
                                    </Link>
                                    
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                                    
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-white/85 border-2 border-slate-200 dark:border-indigo-500/40 rounded-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-white dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 transition-all">
                                <LogIn size={16} />
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 shadow-[0_2px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.45)] transition-all -translate-y-px">
                                <UserPlus size={16} />
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>

                <button 
                    className="md:hidden p-2 text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu size={24} />
                </button>
            </div>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden px-4 md:px-6 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f19]">
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                location.pathname === '/'
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/courses"
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                location.pathname === '/courses'
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Khóa học
                        </Link>
                        
                        {user ? (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{displayName}</span>
                                        <span className={`text-[10px] w-fit font-bold px-2 py-0.5 mt-1 rounded-md uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleBadge(user.role)}
                                        </span>
                                    </div>
                                </div>
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User size={16} />
                                    Hồ sơ cá nhân
                                </Link>
                                <Link 
                                    to="/change-password" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Key size={16} />
                                    Đổi mật khẩu
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                >
                                    <LogOut size={16} />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link 
                                    to="/login" 
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LogIn size={16} />
                                    Đăng nhập
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <UserPlus size={16} />
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
