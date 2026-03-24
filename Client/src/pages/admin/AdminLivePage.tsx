import axios from "axios";
import { useState } from "react";
import { Video, Plus, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import {
  useAuth,
  useCourses,
  useLiveSessions,
  useCreateLiveSession,
} from "@/hooks";
import type { CourseDTO } from "@/types";

export default function AdminLivePage() {
  const { user } = useAuth();
  const canManageLive = user?.role === "ADMIN" || user?.role === "TEACHER";

  const { data: courses = [] } = useCourses({ enabled: canManageLive });
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useLiveSessions({ enabled: canManageLive });
  const createMutation = useCreateLiveSession();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find((c: CourseDTO) => c.id === courseId);
    return course ? course.title : "Khóa học không xác định";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.title.trim() || !formState.courseId) {
      setFormError("Vui lòng điền tiêu đề và chọn khóa học.");
      return;
    }

    try {
      await createMutation.mutateAsync(formState);
      setIsFormOpen(false);
      setFormState({ title: "", description: "", courseId: "" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(
          err.response?.data?.message || "Không thể tạo phòng Live.",
        );
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Không thể tạo phòng Live.");
      }
    }
  };

  if (!canManageLive) {
    return (
      <div className="p-6 flex justify-center mt-20">
        <p className="text-slate-600">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lớp học Live</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý và giám sát các buổi học trực tuyến
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Tạo lớp học Live</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Đang tải danh sách Live Sessions...</p>
          </div>
        ) : isError ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="w-8 h-8 mb-4" />
            <p>Lỗi khi tải dữ liệu: {(error as Error).message}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Chưa có lớp Live nào
            </h3>
            <p className="text-slate-500 text-sm">
              Hãy tạo một lớp học Live mới để bắt đầu giảng dạy.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold">Tên buổi học</th>
                  <th className="py-4 px-6 font-semibold">Khóa học</th>
                  <th className="py-4 px-6 font-semibold">Mã phòng</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-right">
                    Tham gia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">
                        {session.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {session.description}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {getCourseName(session.courseId)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {session.roomName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          session.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {session.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : "Đã kết thúc"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {session.status === "ACTIVE" && (
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/live/${session.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Tham gia"
                            className="p-2 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Tạo lớp học Live mới
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Thuộc khóa học
                <select
                  value={formState.courseId}
                  onChange={(e) =>
                    setFormState({ ...formState, courseId: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c: CourseDTO) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Tiêu đề buổi Live
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState({ ...formState, title: e.target.value })
                  }
                  placeholder="Ví dụ: Giải đáp thắc mắc bài 1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Mô tả (Tùy chọn)
                <textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                  placeholder="Nhập nội dung chính của buổi chia sẻ..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </label>

              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
                  disabled={createMutation.isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo buổi Live"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
