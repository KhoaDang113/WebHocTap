import { Users, GraduationCap, BookOpen, Video, FileText, AlertTriangle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { title: "Tổng số Sinh viên", value: "12,450", icon: <GraduationCap className="w-6 h-6 text-blue-500" />, trend: "+12%" },
  { title: "Tổng số Giảng viên", value: "450", icon: <Users className="w-6 h-6 text-green-500" />, trend: "+2%" },
  { title: "Khóa học hoạt động", value: "856", icon: <BookOpen className="w-6 h-6 text-purple-500" />, trend: "+5%" },
  { title: "Buổi Live đang diễn ra", value: "24", icon: <Video className="w-6 h-6 text-red-500" />, trend: "Real-time" },
  { title: "Bài kiểm tra hệ thống", value: "3,200", icon: <FileText className="w-6 h-6 text-orange-500" />, trend: "+18%" },
  { title: "Yêu cầu chờ duyệt", value: "15", icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, trend: "-3%" },
];

const userGrowthData = [
  { month: "Tháng 1", users: 10000 },
  { month: "Tháng 2", users: 10500 },
  { month: "Tháng 3", users: 11200 },
  { month: "Tháng 4", users: 11800 },
  { month: "Tháng 5", users: 12500 },
  { month: "Tháng 6", users: 12900 },
];

const recentActivities = [
  { id: 1, action: "Giảng viên Nguyễn Văn A tạo khóa học 'Nhập môn Lập trình Python'", time: "10 phút trước", type: "course" },
  { id: 2, action: "Phòng học Live 'Giải tích 1' được mở", time: "25 phút trước", type: "live" },
  { id: 3, action: "Sinh viên Trần Thị B nộp bài tập 'Đồ án cuối kỳ'", time: "1 giờ trước", type: "assignment" },
  { id: 4, action: "Tài khoản sv_20201234 bị khóa do vi phạm nội quy", time: "3 giờ trước", type: "security" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Tổng quan</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi hoạt động hệ thống nền tảng học tập nội bộ</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
             Xuất báo cáo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-blue-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tăng trưởng người dùng</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Hoạt động gần đây
               </h3>
               <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Xem tất cả</button>
            </div>
            <div className="p-5">
               <div className="relative border-l border-slate-200 ml-3 space-y-6">
                 {recentActivities.map((act) => (
                   <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-500"></div>
                      <p className="text-sm font-medium text-slate-800">{act.action}</p>
                      <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                   </div>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
