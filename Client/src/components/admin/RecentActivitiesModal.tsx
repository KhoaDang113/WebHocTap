import { X, Activity } from "lucide-react";
import { useAuth, useUsers, useCourses, useLiveSessions } from "@/hooks";
import { useMemo } from "react";

interface RecentActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function RecentActivitiesModal({ isOpen, onClose }: RecentActivitiesModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data: users = [] } = useUsers({ enabled: isAdmin && isOpen });
  const { data: courses = [] } = useCourses({ enabled: isAdmin && isOpen });
  const { data: liveSessions = [] } = useLiveSessions({ enabled: isAdmin && isOpen });

  const recentActivities = useMemo(() => {
    if (!isOpen) return [];
    
    const activities: { id: string; action: string; time: string; date: Date; type: string }[] = [];
    const now = new Date();
    // 2 days ago boundary
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // New user registrations
    if (users && users.length > 0) {
      users
        .filter((u: any) => u.createdAt && new Date(u.createdAt) >= twoDaysAgo)
        .forEach((u: any) => {
          const roleLabel = ROLE_LABELS[u.role] || u.role;
          activities.push({
            id: `user-${u.id}`,
            action: `${roleLabel} ${u.fullName || u.username} đã đăng ký tài khoản`,
            time: formatRelativeTime(u.createdAt),
            date: new Date(u.createdAt),
            type: "user",
          });
        });

      // Locked users
      users
        .filter((u: any) => u.isLocked && u.updatedAt && new Date(u.updatedAt) >= twoDaysAgo)
        .forEach((u: any) => {
          activities.push({
            id: `lock-${u.id}`,
            action: `Tài khoản ${u.username} bị khóa`,
            time: formatRelativeTime(u.updatedAt),
            date: new Date(u.updatedAt),
            type: "security",
          });
        });
    }

    // Recent courses
    if (courses && courses.length > 0) {
      courses
        .filter((c: any) => c.createdAt && new Date(c.createdAt) >= twoDaysAgo)
        .forEach((c: any) => {
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
      liveSessions
        .filter((s: any) => s.createdAt && new Date(s.createdAt) >= twoDaysAgo)
        .forEach((s: any) => {
          activities.push({
            id: `live-${s.id}`,
            action: `Phòng học Live '${s.title}' được mở`,
            time: formatRelativeTime(s.createdAt),
            date: new Date(s.createdAt),
            type: "live",
          });
        });
    }

    // Sort descending by date
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [users, courses, liveSessions, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tất cả hoạt động</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lịch sử hoạt động trong 2 ngày gần nhất</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <div className="relative border-l border-slate-200 ml-3 space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => {
                const dotColor = act.type === "course" ? "border-purple-500" : act.type === "live" ? "border-red-500" : act.type === "security" ? "border-orange-500" : "border-blue-500";
                return (
                  <div key={act.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 ${dotColor}`}></div>
                    <p className="text-sm font-medium text-slate-800">{act.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 pl-6 py-4">Không có hoạt động nào trong 2 ngày qua.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
