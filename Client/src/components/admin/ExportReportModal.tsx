import { useState } from "react";
import { X, FileSpreadsheet, Users, BookOpen, FileText, LayoutDashboard, Loader2 } from "lucide-react";
import { useUsers, useCourses } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { getAllAttempts } from "@/api/quizApi";
import { useAuth } from "@/hooks";
import {
  exportUsersReport,
  exportCoursesReport,
  exportQuizAttemptsReport,
  exportSummaryReport,
} from "@/utils/excelExport";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPORTS = [
  {
    id: "users",
    icon: <Users className="w-6 h-6 text-blue-500" />,
    bgIcon: "bg-blue-50",
    title: "Báo cáo Người dùng",
    description: "Xuất danh sách toàn bộ tài khoản (sinh viên & giảng viên), bao gồm vai trò, trạng thái, ngày tham gia.",
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50",
    badge: "Excel",
  },
  {
    id: "courses",
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    bgIcon: "bg-purple-50",
    title: "Báo cáo Khóa học",
    description: "Tổng hợp các khóa học: tên, giảng viên, giá, trạng thái, đánh giá trung bình.",
    color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50/50",
    badge: "Excel",
  },
  {
    id: "quizzes",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    bgIcon: "bg-orange-50",
    title: "Báo cáo Kết quả Quiz",
    description: "Tất cả lượt thi: điểm số, tỷ lệ đúng, thời gian nộp bài của từng học viên.",
    color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50",
    badge: "Excel",
  },
  {
    id: "summary",
    icon: <LayoutDashboard className="w-6 h-6 text-green-600" />,
    bgIcon: "bg-green-50",
    title: "Báo cáo Tổng hợp",
    description: "File Excel nhiều sheet: tổng quan hệ thống + người dùng + khóa học trong một file duy nhất.",
    color: "border-green-200 hover:border-green-400 hover:bg-green-50/50",
    badge: "Multi-sheet",
  },
];

export default function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: users = [] } = useUsers({ enabled: isAdmin && isOpen });
  const { data: courses = [] } = useCourses({ enabled: isAdmin && isOpen });

  const { data: attemptsRes } = useQuery({
    queryKey: ["admin-all-attempts"],
    queryFn: getAllAttempts,
    enabled: isAdmin && isOpen,
  });
  const attempts = attemptsRes?.data || [];

  if (!isOpen) return null;

  const handleExport = async (reportId: string) => {
    setExporting(reportId);
    try {
      // Small delay for UX feedback
      await new Promise((r) => setTimeout(r, 200));

      if (reportId === "users") {
        exportUsersReport(users as any);
      } else if (reportId === "courses") {
        exportCoursesReport(courses as any);
      } else if (reportId === "quizzes") {
        exportQuizAttemptsReport(attempts);
      } else if (reportId === "summary") {
        exportSummaryReport(users as any, courses as any, attempts);
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Xuất báo cáo Excel</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chọn loại báo cáo bạn muốn xuất</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Report options */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REPORTS.map((report) => (
            <div
              key={report.id}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${report.color} ${
                exporting === report.id ? "opacity-70" : ""
              }`}
              onClick={() => !exporting && handleExport(report.id)}
            >
              {/* Badge */}
              <span className="absolute top-3 right-3 text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {report.badge}
              </span>

              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${report.bgIcon}`}>
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{report.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>

              {/* Loading state */}
              {exporting === report.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <Loader2 size={16} className="animate-spin" />
                    Đang xuất...
                  </div>
                </div>
              )}

              {/* Download icon hint */}
              {!exporting && (
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                  <FileSpreadsheet size={12} />
                  <span>Nhấn để tải xuống</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-5 pb-5">
          <p className="text-xs text-center text-slate-400 bg-slate-50 py-2.5 rounded-lg border border-slate-100">
            📌 File Excel sẽ được tải xuống tự động vào máy tính của bạn
          </p>
        </div>
      </div>
    </div>
  );
}
