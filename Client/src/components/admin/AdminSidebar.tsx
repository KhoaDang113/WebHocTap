import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, Video, Settings, LogOut, ChevronLeft, ChevronRight, Layers, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { to: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/admin/users", icon: <Users size={20} />, label: "Quản lý User" },
    { to: "/admin/categories", icon: <Layers size={20} />, label: "Danh mục" },
    { to: "/admin/courses", icon: <BookOpen size={20} />, label: "Khóa học" },
    { to: "/admin/lessons", icon: <BookOpen size={20} />, label: "Bài học" },
    { to: "/admin/quizzes", icon: <HelpCircle size={20} />, label: "Quiz / Câu hỏi" },
    { to: "/admin/live", icon: <Video size={20} />, label: "Lớp học Live" },
    { to: "/admin/settings", icon: <Settings size={20} />, label: "Cài đặt" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-white text-slate-800 min-h-screen flex flex-col border-r border-slate-200 transition-all duration-300`}>
      <div className={`p-6 flex items-center ${isCollapsed ? "flex-col justify-center gap-4" : "justify-between"}`}>
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" />
          {!isCollapsed && <h2 className="text-xl font-bold text-blue-600">EduTech Admin</h2>}
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
            className={`flex items-center gap-3 py-3 rounded-lg transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"} ${
              isActive(link.to)
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <div className={`${isActive(link.to) ? "text-blue-600" : ""}`}>{link.icon}</div>
            {!isCollapsed && <span className="font-medium">{link.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button 
          title={isCollapsed ? "Đăng xuất" : ""}
          className={`flex items-center gap-3 py-3 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
