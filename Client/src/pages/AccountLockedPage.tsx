import { ShieldX, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountLockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldX className="text-red-600" size={40} />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Tài khoản đã bị khóa
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Tài khoản của bạn đã bị khóa bởi quản trị viên. Bạn không thể đăng nhập vào hệ thống.
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-slate-50 rounded-xl p-5 space-y-3 text-left">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Vui lòng liên hệ để được hỗ trợ:
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="text-blue-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <a
                href="mailto:gaodo24@gmail.com"
                className="text-blue-600 hover:underline font-medium"
              >
                gaodo24@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Phone className="text-green-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Số điện thoại</p>
              <a
                href="tel:0123456678"
                className="text-green-600 hover:underline font-medium"
              >
                0123456678
              </a>
            </div>
          </div>
        </div>

        {/* Back to login */}
        <Link
          to="/login"
          className="inline-block w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
