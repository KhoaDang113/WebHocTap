import axios from "axios";
import { useState, useMemo } from "react";
import {
  Video,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  useAuth,
  useCourses,
  useLiveSessions,
  useCreateLiveSession,
  useMyLiveSchedules,
  useCreateLiveSchedule,
  useCancelLiveSchedule,
} from "@/hooks";
import { endLiveSession } from "@/api/liveSessionApi";
import { useQueryClient } from "@tanstack/react-query";
import type { CourseDTO, LiveSessionDTO } from "@/types";
import LiveTimetable from "@/components/instructor/LiveTimetable";

export default function InstructorLivePage() {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const queryClient = useQueryClient();

  // Chỉ lấy các buổi đang ACTIVE cho giảng viên
  const { data: allCourses = [] } = useCourses({ enabled: isTeacher });
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useLiveSessions({
    enabled: isTeacher,
  });

  // Chỉ lấy các khóa học của chính giảng viên này
  const instructorCourses = useMemo(() => {
    return allCourses.filter(
      (course) =>
        course.instructor === user?.username || course.instructor === user?.id,
    );
  }, [allCourses, user]);

  const createMutation = useCreateLiveSession();
  const createScheduleMutation = useCreateLiveSchedule();
  const cancelScheduleMutation = useCancelLiveSchedule();

  const { data: schedules = [] } =
    useMyLiveSchedules({ enabled: isTeacher });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "timetable">(
    "timetable",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));

  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sessions.slice(start, start + pageSize);
  }, [sessions, currentPage, pageSize]);

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  const [scheduleFormState, setScheduleFormState] = useState({
    title: "",
    description: "",
    courseId: "",
    startTime: "",
  });

  const handleEndSession = async (sessionId: string, title: string) => {
    if (
      !globalThis.confirm(
        `Bạn có chắc muốn kết thúc buổi live "${title}" không?`,
      )
    ) {
      return;
    }

    try {
      await endLiveSession(sessionId);
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
    } catch {
      alert("Không thể kết thúc buổi live. Vui lòng thử lại.");
    }
  };

  const getCourseName = (courseId: string) => {
    const course = allCourses.find((c: CourseDTO) => c.id === courseId);
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

  const handleCancelSchedule = async (scheduleId: string, title: string) => {
    if (!globalThis.confirm(`Bạn có chắc muốn hủy lịch "${title}" không?`))
      return;
    try {
      await cancelScheduleMutation.mutateAsync(scheduleId);
    } catch {
      alert("Không thể hủy lịch. Vui lòng thử lại.");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFormError(null);

    if (
      !scheduleFormState.title.trim() ||
      !scheduleFormState.courseId ||
      !scheduleFormState.startTime
    ) {
      setScheduleFormError("Vui lòng điền tiêu đề, khóa học và thời gian.");
      return;
    }

    try {
      await createScheduleMutation.mutateAsync(scheduleFormState);
      setIsScheduleFormOpen(false);
      setScheduleFormState({
        title: "",
        description: "",
        courseId: "",
        startTime: "",
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setScheduleFormError(
          err.response?.data?.message || "Không thể tạo lịch.",
        );
      } else {
        setScheduleFormError("Không thể tạo lịch.");
      }
    }
  };

  const openCreateWithSlot = (date?: Date, hour?: number) => {
    if (date && hour !== undefined) {
      // Format to YYYY-MM-DDThh:mm for datetime-local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hourStr = String(hour).padStart(2, "0");
      const startTime = `${year}-${month}-${day}T${hourStr}:00`;

      setScheduleFormState({
        title: "",
        description: "",
        courseId: "",
        startTime,
      });
    }
    setIsScheduleFormOpen(true);
  };

  if (!isTeacher) {
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
          <h1 className="text-2xl font-bold text-indigo-600">Lớp học Live</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý các buổi dạy trực tuyến của bạn
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => openCreateWithSlot()}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Calendar size={18} />
            <span>Lên lịch livestream</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Tạo phòng Live ngay</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("timetable")}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === "timetable"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            Thời khóa biểu
          </div>
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === "active"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Video size={16} />
            Phòng Live đang chạy
          </div>
        </button>
      </div>

      {activeTab === "timetable" ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <LiveTimetable
            schedules={schedules}
            getCourseName={getCourseName}
            onCancel={handleCancelSchedule}
            onOpenCreate={openCreateWithSlot}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Video className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">
              Danh sách các phòng đang trực tuyến
            </h2>
          </div>
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
              <p>Đang tải danh sách Live Sessions...</p>
            </div>
          ) : isError ? (
            <div className="p-12 flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="w-8 h-8 mb-4" />
              <p>Lỗi khi tải dữ liệu: {(error as Error).message}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm">
                Hiện tại không có phòng Live nào đang chạy.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-600 text-sm border-b border-slate-200">
                      <th className="py-4 px-6 font-semibold">Tên buổi học</th>
                      <th className="py-4 px-6 font-semibold">Khóa học</th>
                      <th className="py-4 px-6 font-semibold">Mã phòng</th>
                      <th className="py-4 px-6 font-semibold">Trạng thái</th>
                      <th className="py-4 px-6 font-semibold text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSessions.map((session: LiveSessionDTO) => (
                      <tr
                        key={session.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm">
                          <p className="font-bold text-slate-800">
                            {session.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {session.description}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {getCourseName(session.courseId)}
                        </td>
                        <td className="py-4 px-6 text-xs font-mono text-slate-500">
                          {session.roomName}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                            {}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/live/${session.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Tham gia"
                            >
                              <ExternalLink size={18} />
                            </a>
                            <button
                              onClick={() =>
                                handleEndSession(session.id, session.title)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Kết thúc"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Trang {currentPage} / {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors border border-slate-200"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors border border-slate-200"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal form - Tạo phòng Live ngay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Tạo phòng Live ngay
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Chọn khóa học
                </label>
                <select
                  value={formState.courseId}
                  onChange={(e) =>
                    setFormState({ ...formState, courseId: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900"
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {instructorCourses.map((c: CourseDTO) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tiêu đề buổi Live
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState({ ...formState, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                  placeholder="Mô tả ngắn gọn..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900 resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Bắt đầu ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal - Lên lịch Livestream */}
      {isScheduleFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Lên lịch Livestream mới
              </h2>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Chọn khóa học
                </label>
                <select
                  value={scheduleFormState.courseId}
                  onChange={(e) =>
                    setScheduleFormState({
                      ...scheduleFormState,
                      courseId: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900"
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {instructorCourses.map((c: CourseDTO) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={scheduleFormState.title}
                  onChange={(e) =>
                    setScheduleFormState({
                      ...scheduleFormState,
                      title: e.target.value,
                    })
                  }
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={scheduleFormState.startTime}
                  onChange={(e) =>
                    setScheduleFormState({
                      ...scheduleFormState,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mô tả (Tùy chọn)
                </label>
                <textarea
                  value={scheduleFormState.description}
                  onChange={(e) =>
                    setScheduleFormState({
                      ...scheduleFormState,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nội dung buổi học..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-slate-900 resize-none"
                />
              </div>

              {scheduleFormError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                  {scheduleFormError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsScheduleFormOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createScheduleMutation.isPending}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  {createScheduleMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu vào thời khóa biểu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
