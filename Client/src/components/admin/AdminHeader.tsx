import { Bell } from "lucide-react";
import { useAuth } from "@/hooks";

export default function AdminHeader() {
  const { user } = useAuth();
  const displayName = user?.username?.split('@')[0] || "Admin";

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div></div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role}</p>
          </div>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={displayName} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
              {displayName.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
