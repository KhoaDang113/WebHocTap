import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, BookOpen, LogOut, ChevronLeft, ChevronRight, GraduationCap, Video } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks"

export function InstructorSidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()

  const links = [
    { to: "/instructor/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/instructor/courses", icon: <BookOpen size={20} />, label: "Khóa học" },
    { to: "/instructor/live", icon: <Video size={20} />, label: "Lớp học Live" },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-white text-slate-800 min-h-screen flex flex-col border-r border-slate-200 transition-all duration-300`}>
      <div className={`p-6 flex items-center ${isCollapsed ? "flex-col justify-center gap-4" : "justify-between"}`}>
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-600" />
          {!isCollapsed && <h2 className="text-xl font-bold text-indigo-600">EduInstructor</h2>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-2 mt-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            title={isCollapsed ? link.label : ""}
            className={`flex items-center gap-3 py-3 rounded-lg transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"} ${isActive(link.to)
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              }`}
          >
            <div className={`${isActive(link.to) ? "text-indigo-600" : ""}`}>{link.icon}</div>
            {!isCollapsed && <span className="font-medium">{link.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          title={isCollapsed ? "Đăng xuất" : ""}
          onClick={() => logout()}
          className={`flex items-center gap-3 py-3 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
