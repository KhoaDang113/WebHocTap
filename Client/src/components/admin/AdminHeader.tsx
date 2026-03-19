import { Bell, Search, User } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96">
        <Search className="text-slate-400 w-5 h-5 mr-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          className="bg-transparent border-none outline-none w-full text-sm text-slate-700"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800">Admin Portal</p>
            <p className="text-xs text-slate-500">Quản trị viên</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
