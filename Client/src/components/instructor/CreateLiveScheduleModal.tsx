import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useCreateLiveSchedule } from "@/hooks";
import type { CourseDTO } from "@/types";
import axios from "axios";

interface CreateLiveScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseDTO[];
  initialStartTime?: string;
}

export default function CreateLiveScheduleModal({
  isOpen,
  onClose,
  courses,
  initialStartTime,
}: CreateLiveScheduleModalProps) {
  const [scheduleFormState, setScheduleFormState] = useState({
    title: "",
    description: "",
    courseId: "",
    startTime: "",
  });
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(
    null,
  );
  const createScheduleMutation = useCreateLiveSchedule();

  useEffect(() => {
    if (isOpen) {
      setScheduleFormState({
        title: "",
        description: "",
        courseId: "",
        startTime: initialStartTime || "",
      });
      setScheduleFormError(null);
    }
  }, [isOpen, initialStartTime]);

  if (!isOpen) return null;

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
      setScheduleFormState({
        title: "",
        description: "",
        courseId: "",
        startTime: "",
      });
      onClose();
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

  return (
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
              {courses.map((c: CourseDTO) => (
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
              onClick={onClose}
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
  );
}
