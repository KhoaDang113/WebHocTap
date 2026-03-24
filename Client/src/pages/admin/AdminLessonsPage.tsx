import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Search, BookOpen } from "lucide-react";
import { useAllLessons, useCourses } from "@/hooks";
import type { LessonDTO, CourseDTO } from "@/types";

export default function AdminLessonsPage() {
  const { data: lessons = [], isLoading: isLessonsLoading, isError: isLessonsError, error: lessonsError } = useAllLessons();
  const { data: courses = [] } = useCourses();

  const [searchTerm, setSearchTerm] = useState("");

  const courseMap = useMemo(
    () => Object.fromEntries(courses.map((course: CourseDTO) => [course.id, course.title])),
    [courses]
  );

  const filteredLessons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return lessons.filter((lesson) => 
      keyword.length === 0 || 
      lesson.title.toLowerCase().includes(keyword) ||
      lesson.courseId.toLowerCase().includes(keyword)
    );
  }, [lessons, searchTerm]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return message || fallback;
  };

  if (isLessonsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-600">Đang tải danh sách bài học...</p>
        </div>
      </div>
    );
  }

  if (isLessonsError) {
    const message = getErrorMessage(lessonsError, "Không thể tải dữ liệu bài học.");
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Lỗi: {message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý bài học</h1>
          <p className="text-slate-500 text-sm mt-1">Xem danh sách tất cả các bài học trong hệ thống.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Tìm theo tiêu đề hoặc Course ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">Tiêu đề bài học</th>
                <th className="py-4 px-6 font-semibold">Khóa học</th>
                <th className="py-4 px-6 font-semibold">Thứ tự</th>
                <th className="py-4 px-6 font-semibold">ID Khóa học</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-slate-500">
                    Chưa có bài học nào.
                  </td>
                </tr>
              )}

              {filteredLessons.map((lesson: LessonDTO) => (
                <tr key={lesson.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                        <BookOpen size={16} />
                      </div>
                      <p className="font-medium text-slate-800">{lesson.title}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {courseMap[lesson.courseId] || "Không xác định"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {lesson.orderIndex}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                    {lesson.courseId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
