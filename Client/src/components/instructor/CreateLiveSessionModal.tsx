import { useState } from "react";
import { Video } from "lucide-react";
import { useCreateLiveSession } from "@/hooks";
import type { CourseDTO } from "@/types";
import axios from "axios";

interface CreateLiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseDTO[];
}

export default function CreateLiveSessionModal({
  isOpen,
  onClose,
  courses,
}: CreateLiveSessionModalProps) {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    courseId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateLiveSession();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.title.trim() || !formState.courseId) {
      setFormError("Vui lòng điền tiêu đề và chọn khóa học.");
      return;
    }

    try {
      await createMutation.mutateAsync(formState);
      onClose();
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

  return (
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
              {courses.map((c: CourseDTO) => (
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
              onClick={onClose}
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
  );
}
