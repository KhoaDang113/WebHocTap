import { Users, GraduationCap, BookOpen, Video, FileText, Activity, Loader2, FileSpreadsheet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useUsers, useCourses, useLiveSessions } from "@/hooks";
import { getAllQuizzes } from "@/api/quizApi";
import ExportReportModal from "@/components/admin/ExportReportModal";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const ROLE_LABELS: Record<string, string> = {
  TEACHER: "Giảng viên",
  STUDENT: "Sinh viên",
  ADMIN: "Quản trị viên",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers } = useUsers({ enabled: isAdmin });
  const { data: courses = [], isLoading: isLoadingCourses } = useCourses({ enabled: isAdmin });
  const { data: liveSessions = [], isLoading: isLoadingLive } = useLiveSessions({ enabled: isAdmin });

  const { data: quizzesRes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: getAllQuizzes,
    enabled: isAdmin
  });

  const quizzes = quizzesRes?.data || [];

  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const now = new Date();
    const monthsToShow = 6;
    const result: { month: string; users: number }[] = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const cumulativeCount = users.filter((u: any) => {
        const created = new Date(u.createdAt);
        return created <= endOfMonth;
      }).length;

      const label = MONTH_NAMES[targetDate.getMonth()];
      result.push({ month: `${label}/${targetDate.getFullYear()}`, users: cumulativeCount });
    }

    return result;
  }, [users]);

  // Build recent activities from real data
  const recentActivities = useMemo(() => {
    const activities: { id: string; action: string; time: string; date: Date; type: string }[] = [];

    // New user registrations
    if (users && users.length > 0) {
      const sorted = [...users]
        .filter((u: any) => u.createdAt)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      sorted.slice(0, 5).forEach((u: any) => {
        const roleLabel = ROLE_LABELS[u.role] || u.role;
        activities.push({
          id: `user-${u.id}`,
          action: `${roleLabel} ${u.fullName || u.username} đã đăng ký tài khoản`,
          time: formatRelativeTime(u.createdAt),
          date: new Date(u.createdAt),
          type: "user",
        });

        if (u.isLocked) {
          activities.push({
            id: `lock-${u.id}`,
            action: `Tài khoản ${u.username} bị khóa`,
            time: formatRelativeTime(u.updatedAt || u.createdAt),
            date: new Date(u.updatedAt || u.createdAt),
            type: "security",
          });
        }
      });
    }

    // Recent courses
    if (courses && courses.length > 0) {
      const sorted = [...courses]
        .filter((c: any) => c.createdAt)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      sorted.slice(0, 5).forEach((c: any) => {
        const instructorLabel = c.instructor ? `Giảng viên ${c.instructor}` : "Một giảng viên";
        activities.push({
          id: `course-${c.id}`,
          action: `${instructorLabel} tạo khóa học '${c.title}'`,
          time: formatRelativeTime(c.createdAt),
          date: new Date(c.createdAt),
          type: "course",
        });
      });
    }

    // Active live sessions
    if (liveSessions && liveSessions.length > 0) {
      const sorted = [...liveSessions]
        .filter((s: any) => s.createdAt)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      sorted.slice(0, 3).forEach((s: any) => {
        activities.push({
          id: `live-${s.id}`,
          action: `Phòng học Live '${s.title}' được mở`,
          time: formatRelativeTime(s.createdAt),
          date: new Date(s.createdAt),
          type: "live",
        });
      });
    }

    // Sort all by date descending and return top 8
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [users, courses, liveSessions]);

  const statsData = useMemo(() => {
    const totalStudents = users.filter((u: any) => u.role === 'STUDENT').length;
    const totalTeachers = users.filter((u: any) => u.role === 'TEACHER').length;
    const activeCourses = courses.filter((c: any) => c.status === 'PUBLISHED').length;
    const activeLiveSessions = liveSessions.filter((s: any) => s.status === 'ONGOING' || s.status === 'ACTIVE').length;
    const totalQuizzes = quizzes.length;

    return [
      { title: "Tổng số Sinh viên", value: totalStudents.toLocaleString(), icon: <GraduationCap className="w-6 h-6 text-blue-500" />, /* trend: "+12%" */ },
      { title: "Tổng số Giảng viên", value: totalTeachers.toLocaleString(), icon: <Users className="w-6 h-6 text-green-500" />, /* trend: "+2%" */ },
      { title: "Khóa học hoạt động", value: activeCourses.toLocaleString(), icon: <BookOpen className="w-6 h-6 text-purple-500" />, /* trend: "+5%" */ },
      { title: "Buổi Live đang diễn ra", value: activeLiveSessions.toLocaleString(), icon: <Video className="w-6 h-6 text-red-500" />, /* trend: "Real-time" */ },
      { title: "Bài kiểm tra hệ thống", value: totalQuizzes.toLocaleString(), icon: <FileText className="w-6 h-6 text-orange-500" />, /* trend: "+18%" */ },
    ];
  }, [users, courses, liveSessions, quizzes]);

  const isLoading = isLoadingUsers || isLoadingCourses || isLoadingLive || isLoadingQuizzes;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          <p className="text-slate-600">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Tổng quan</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi hoạt động hệ thống nền tảng học tập nội bộ</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                {/* <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-blue-500'}`}>
                  {stat.trend}
                </span> */}
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
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
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
              {recentActivities.length > 0 ? recentActivities.map((act) => {
                const dotColor = act.type === "course" ? "border-purple-500" : act.type === "live" ? "border-red-500" : act.type === "security" ? "border-orange-500" : "border-blue-500";
                return (
                  <div key={act.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 ${dotColor}`}></div>
                    <p className="text-sm font-medium text-slate-800">{act.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-400 pl-6">Chưa có hoạt động nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExportReportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}

