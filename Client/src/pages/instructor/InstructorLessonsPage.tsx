import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  AlertCircle,
  FileText,
  ChevronRight
} from "lucide-react";
import { useAuth, useCourses, useAllLessons, useDeleteLesson } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function InstructorLessonsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId');
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId);

  useEffect(() => {
    if (initialCourseId && !selectedCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  const { data: allCourses = [], isLoading: isCoursesLoading, isError: isCoursesError } = useCourses();
  const { data: allLessons = [], isLoading: isLessonsLoading, isError: isLessonsError } = useAllLessons();
  const { mutateAsync: deleteLesson } = useDeleteLesson(selectedCourseId || "");

  // Filter courses belonging to this instructor
  const instructorCourses = useMemo(() => {
    return allCourses.filter(course => course.instructor === user?.username);
  }, [allCourses, user]);

  // Group lessons by course
  const groupedData = useMemo(() => {
    const map: Record<string, {
      courseId: string;
      courseTitle: string;
      lessonCount: number;
    }> = {};

    instructorCourses.forEach(course => {
      map[course.id] = {
        courseId: course.id,
        courseTitle: course.title,
        lessonCount: 0
      };
    });

    allLessons.forEach(lesson => {
      if (map[lesson.courseId]) {
        map[lesson.courseId].lessonCount++;
      }
    });

    return Object.values(map).sort((a, b) => b.lessonCount - a.lessonCount);
  }, [instructorCourses, allLessons]);

  const selectedCourseLessons = useMemo(() => {
    if (!selectedCourseId) return [];
    return allLessons
      .filter(l => l.courseId === selectedCourseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [allLessons, selectedCourseId]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!selectedCourseId) {
      return groupedData.filter(item => item.courseTitle.toLowerCase().includes(keyword));
    }
    return selectedCourseLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(keyword) || 
      (lesson.content?.toLowerCase() || "").includes(keyword)
    );
  }, [groupedData, selectedCourseLessons, selectedCourseId, searchTerm]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa bài học "${title}" không?`)) {
      try {
        await deleteLesson(id);
      } catch (err) {
        alert("Không thể xóa bài học. Vui lòng thử lại.");
      }
    }
  };

  const isLoading = isCoursesLoading || isLessonsLoading;

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {selectedCourseId && (
            <button
              onClick={() => {
                setSelectedCourseId(null);
                setSearchTerm("");
              }}
              className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {selectedCourseId ? "Quản lý bài học" : "Bài giảng & Học phẩm"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {selectedCourseId 
                ? `Đang quản lý bài học cho: ${groupedData.find(c => c.courseId === selectedCourseId)?.courseTitle}` 
                : "Quản lý danh sách bài giảng trong từng khóa học của bạn."}
            </p>
          </div>
        </div>

        {selectedCourseId && (
          <button
            onClick={() => navigate(`/instructor/courses/${selectedCourseId}/lessons/create`)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={3} />
            Tạo bài học mới
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={selectedCourseId ? "Tìm theo tiêu đề bài học..." : "Tìm kiếm theo tên khóa học..."}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {isCoursesError || isLessonsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-center gap-3 font-bold animate-shake">
            <AlertCircle size={20} />
            Lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {!selectedCourseId ? (
            <motion.div
              key="course-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {isLoading ? (
                Array(3).fill(null).map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                       <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                       <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : filteredItems.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold">Bạn chưa có khóa học nào hoặc không tìm thấy kết quả.</p>
                </div>
              ) : (
                (filteredItems as any[]).map((course) => (
                  <motion.div
                    key={course.courseId}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setSelectedCourseId(course.courseId);
                      setSearchTerm("");
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
                       <div className="w-14 h-14 bg-slate-50 text-indigo-500 rounded-xl flex flex-shrink-0 items-center justify-center border border-slate-100">
                          <BookOpen size={24} />
                       </div>
                       
                       <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {course.courseTitle}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[11px] font-bold uppercase tracking-wider border border-slate-100">
                                <FileText size={10} /> {course.lessonCount} Bài học
                             </div>
                             <span className="text-slate-300">|</span>
                             <span className="text-[11px] text-slate-400 font-medium truncate">ID: {course.courseId}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                       <div className="hidden sm:flex items-center gap-3 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <span className="text-[11px] font-extrabold uppercase tracking-tighter">Sẵn sàng</span>
                       </div>
                       <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                          Quản lý bài học <ChevronRight size={14} />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="lesson-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                  <Search size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold text-xl uppercase tracking-tighter">Không có bài học phù hợp</p>
                </div>
              ) : (
                (filteredItems as any[]).map((lesson, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={lesson.id}
                    className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-300 transition-all flex flex-col md:flex-row items-center gap-4"
                  >
                    <div className="w-16 h-12 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden">
                       {lesson.imageUrl ? (
                         <img src={lesson.imageUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <ImageIcon size={20} className="text-slate-300" />
                       )}
                    </div>

                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                       </h4>
                       <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {lesson.content ? lesson.content.substring(0, 60) : "Không có mô tả nội dung giáo trình."}
                       </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end px-2">
                       <div className="flex items-center gap-3">
                          {lesson.videoUrl && (
                            <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-blue-100">
                               <Video size={12} /> Video
                            </div>
                          )}
                          <div className="text-[11px] font-black text-indigo-400 bg-indigo-50/50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                             <Clock size={10} /> {lesson.orderIndex}
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => navigate(`/instructor/courses/${selectedCourseId}/lessons/${lesson.id}/edit`)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 transition-all active:scale-90"
                            title="Sửa bài học"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id, lesson.title)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 transition-all active:scale-90"
                            title="Xóa bài học"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
