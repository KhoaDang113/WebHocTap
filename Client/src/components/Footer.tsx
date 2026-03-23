import { Link } from 'react-router-dom'
import { Facebook, Youtube, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8 font-sans">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-6">
                        <Link to="/" className="flex items-center gap-2 no-underline font-bold text-2xl tracking-tight transition-opacity hover:opacity-85">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <span className="text-xl">📚</span>
                            </div>
                            <span className="bg-gradient-to-br from-indigo-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic">
                                WebHocTap
                            </span>
                        </Link>
                        <p className="text-slate-500 text-[15px] leading-relaxed max-w-[280px]">
                            Nền tảng học tập trực tuyến hàng đầu Việt Nam. Mang đến trải nghiệm học tập tốt nhất cho mọi người.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Youtube, Twitter, Instagram].map((Icon, index) => (
                                <a 
                                    key={index}
                                    href="#" 
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all duration-300"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-lg mb-7">Liên kết nhanh</h4>
                        <ul className="flex flex-col gap-4">
                            {['Về chúng tôi', 'Khóa học', 'Giảng viên', 'Blog'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-lg mb-7">Hỗ trợ</h4>
                        <ul className="flex flex-col gap-4">
                            {['Trung tâm trợ giúp', 'Câu hỏi thường gặp', 'Điều khoản sử dụng', 'Chính sách bảo mật'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-lg mb-7">Liên hệ</h4>
                        <ul className="flex flex-col gap-5">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 text-slate-400">
                                    <MapPin size={18} />
                                </div>
                                <span className="text-slate-500 text-[15px] leading-snug">
                                    123 Đường ABC, Quận 1, TP.HCM
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <a href="mailto:contact@webhoctap.vn" className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                                    contact@webhoctap.vn
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <a href="tel:+84123456789" className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                                    (+84) 123 456 789
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm">
                        © {currentYear} WebHocTap. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Điều khoản', 'Quyền riêng tư', 'Cookies'].map((item) => (
                            <Link key={item} to="#" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
