import { useState } from "react";
import { Search, Filter, MoreVertical, Edit, Lock, Trash2, UserPlus, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const mockUsers = [
  { id: 1, avatar: "https://i.pravatar.cc/150?u=1", name: "Nguyễn Văn An", email: "an.nv@edu.vn", role: "Sinh viên", faculty: "CNTT", status: "Hoạt động" },
  { id: 2, avatar: "https://i.pravatar.cc/150?u=2", name: "Trần Thị Bình", email: "binh.tt@edu.vn", role: "Giảng viên", faculty: "Kinh tế", status: "Hoạt động" },
  { id: 3, avatar: "https://i.pravatar.cc/150?u=3", name: "Lê Văn Cường", email: "cuong.lv@edu.vn", role: "Sinh viên", faculty: "Kỹ thuật", status: "Bị khóa" },
  { id: 4, avatar: "https://i.pravatar.cc/150?u=4", name: "Phạm Thu Dung", email: "dung.pt@edu.vn", role: "Giảng viên", faculty: "Ngoại ngữ", status: "Hoạt động" },
  { id: 5, avatar: "https://i.pravatar.cc/150?u=5", name: "Hoàng Minh Tuấn", email: "tuan.hm@edu.vn", role: "Admin", faculty: "Hệ thống", status: "Hoạt động" },
  { id: 6, avatar: "https://i.pravatar.cc/150?u=6", name: "Vũ Hải Yến", email: "yen.vh@edu.vn", role: "Sinh viên", faculty: "CNTT", status: "Chờ duyệt" },
  { id: 7, avatar: "https://i.pravatar.cc/150?u=7", name: "Đặng Quang Hưng", email: "hung.dq@edu.vn", role: "Sinh viên", faculty: "Kinh tế", status: "Hoạt động" },
  { id: 8, avatar: "https://i.pravatar.cc/150?u=8", name: "Bùi Thị Mai", email: "mai.bt@edu.vn", role: "Giảng viên", faculty: "CNTT", status: "Hoạt động" },
];

export default function AdminUserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = mockUsers.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchFaculty = facultyFilter === "all" || user.faculty === facultyFilter;
    const matchStatus = statusFilter === "all" || user.status === statusFilter;
    return matchSearch && matchRole && matchFaculty && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý User</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản, phân quyền và trạng thái người dùng nội bộ</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <UserPlus size={18} />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <Filter size={16} /> Lọc:
            </div>
            
            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Sinh viên">Sinh viên</option>
            </select>

            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
            >
              <option value="all">Tất cả Khoa</option>
              <option value="CNTT">CNTT</option>
              <option value="Kinh tế">Kinh tế</option>
              <option value="Kỹ thuật">Kỹ thuật</option>
              <option value="Ngoại ngữ">Ngoại ngữ</option>
              <option value="Hệ thống">Hệ thống</option>
            </select>

            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Bị khóa">Bị khóa</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold w-12">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-4 px-6 font-semibold">Người dùng</th>
                <th className="py-4 px-6 font-semibold">Vai trò</th>
                <th className="py-4 px-6 font-semibold">Khoa/Đơn vị</th>
                <th className="py-4 px-6 font-semibold">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-6">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'Giảng viên' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-600 font-medium">
                    {user.faculty}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 
                      user.status === 'Bị khóa' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status === 'Hoạt động' && <CheckCircle size={12} />}
                      {user.status === 'Bị khóa' && <XCircle size={12} />}
                      {user.status === 'Chờ duyệt' && <AlertCircle size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                         <Edit size={16} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="Khóa tài khoản">
                         <Lock size={16} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa">
                         <Trash2 size={16} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded">
                         <MoreVertical size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-800">1</span> đến <span className="font-medium text-slate-800">{filteredUsers.length}</span> trong số <span className="font-medium text-slate-800">{mockUsers.length}</span> người dùng
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded bg-blue-600 text-white font-medium text-sm flex items-center justify-center">
              1
            </button>
            <button className="w-8 h-8 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center justify-center">
              2
            </button>
            <button className="w-8 h-8 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center justify-center">
              3
            </button>
            <span className="text-slate-400 px-1">...</span>
            <button className="w-8 h-8 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm flex items-center justify-center">
              12
            </button>
            <button className="p-1.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
