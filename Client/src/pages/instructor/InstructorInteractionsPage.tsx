import { useState, useMemo } from "react";
import {
  Star,
  Search,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import {
  useInstructorReviews,
  useInstructorComments,
  useToggleHideReview,
  useToggleHideComment
} from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import type { ReviewDTO, CommentDTO } from "@/types";

interface CombinedInteraction extends Partial<ReviewDTO>, Partial<CommentDTO> {
  id: string;
  interactionType: 'review' | 'comment';
  userFullName: string;
  createdAt: string;
  isHidden?: boolean;
}

export default function InstructorInteractionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: reviews = [], isLoading: isReviewsLoading, isError: isReviewsError } = useInstructorReviews();
  const { data: comments = [], isLoading: isCommentsLoading, isError: isCommentsError } = useInstructorComments();

  const { mutate: toggleHideReview } = useToggleHideReview();
  const { mutate: toggleHideComment } = useToggleHideComment();

  const courseData = useMemo(() => {
    const map: Record<string, {
      courseId: string;
      courseTitle: string;
      reviews: ReviewDTO[];
      comments: CommentDTO[];
      avgRating: number;
    }> = {};

    reviews.forEach(r => {
      if (!map[r.courseId]) {
        map[r.courseId] = { courseId: r.courseId, courseTitle: r.courseTitle || "Khóa học không xác định", reviews: [], comments: [], avgRating: 0 };
      }
      map[r.courseId].reviews.push(r);
    });

    comments.forEach(c => {
      const cId = c.courseId || "unknown";
      if (!map[cId]) {
        map[cId] = { courseId: cId, courseTitle: c.courseTitle || "Khóa học không xác định", reviews: [], comments: [], avgRating: 0 };
      }
      map[cId].comments.push(c);
    });

    Object.values(map).forEach(course => {
      if (course.reviews.length > 0) {
        course.avgRating = course.reviews.reduce((acc, curr) => acc + curr.rating, 0) / course.reviews.length;
      }
    });

    return Object.values(map).sort((a, b) => (b.reviews.length + b.comments.length) - (a.reviews.length + a.comments.length));
  }, [reviews, comments]);

  const filteredCourses = useMemo(() => {
    return courseData.filter(c => c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [courseData, searchTerm]);

  const selectedCourse = useMemo(() => {
    return courseData.find(c => c.courseId === selectedCourseId);
  }, [courseData, selectedCourseId]);

  const selectedInteractions = useMemo(() => {
    if (!selectedCourse) return [];

    const mappedReviews: CombinedInteraction[] = selectedCourse.reviews.map(r => ({
      ...r,
      interactionType: 'review' as const,
      userFullName: r.userFullName || "Người dùng",
      isHidden: r.isHidden
    }));

    const mappedComments: CombinedInteraction[] = selectedCourse.comments.map(c => ({
      ...c,
      interactionType: 'comment' as const,
      userFullName: c.userFullName || "Người dùng",
      isHidden: c.isHidden
    }));

    const interactions = [...mappedReviews, ...mappedComments];

    return interactions
      .filter(item => {
        const content = item.interactionType === 'review' ? (item as ReviewDTO).comment : (item as CommentDTO).content;
        return (content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userFullName.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedCourse, searchTerm]);

  const isLoading = isReviewsLoading || isCommentsLoading;

  const renderStars = (rating: number, size = 14) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={`${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-5 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        {selectedCourseId && (
          <button
            onClick={() => {
              setSelectedCourseId(null);
              setSearchTerm("");
            }}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {selectedCourseId ? "Chi tiết phản hồi" : "Quản lý Phản hồi"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {selectedCourseId ? `Đang xem: ${selectedCourse?.courseTitle}` : "Chọn một khóa học để xem các đánh giá và bình luận."}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder={selectedCourseId ? "Tìm nội dung hoặc người dùng..." : "Tìm khóa học..."}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="min-h-[500px]">
        {(isReviewsError || isCommentsError) && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium mb-4">
            <AlertCircle size={18} /> Lỗi khi tải dữ liệu.
          </div>
        )}

        <AnimatePresence mode="wait">
          {!selectedCourseId ? (
            <motion.div
              key="course-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {isLoading ? (
                Array(4).fill(null).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse w-full"></div>
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">Không có dữ liệu.</div>
              ) : (
                filteredCourses.map((course) => (
                  <motion.div
                    key={course.courseId}
                    whileHover={{ scale: 1.002, x: 4 }}
                    onClick={() => {
                      setSelectedCourseId(course.courseId);
                      setSearchTerm("");
                    }}
                    className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4 w-full"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{course.courseTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{course.comments.length} Bình luận</span>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">{course.reviews.length} Đánh giá</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 px-4">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Điểm TB</p>
                        <div className="flex items-center gap-1 text-slate-900 font-bold">
                          {course.avgRating.toFixed(1)} <Star className="fill-yellow-400 text-yellow-400" size={14} />
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="interaction-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {selectedInteractions.length === 0 ? (
                <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">Không có phản hồi nào.</div>
              ) : (
                selectedInteractions.map((item, i) => {
                  const isHidden = item.isHidden;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={item.id}
                      className={`bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-4 transition-all w-full ${isHidden ? 'bg-slate-50 opacity-60 border-dashed' : 'hover:border-indigo-300 hover:shadow-sm'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.userAvatar || `https://ui-avatars.com/api/?name=${item.userFullName}&background=6366f1&color=fff`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        {isHidden && (
                          <div className="absolute inset-0 bg-slate-900/10 rounded-lg flex items-center justify-center text-white">
                            <EyeOff size={12} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{item.userFullName}</span>
                          <span className="text-[10px] text-slate-400">• {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.interactionType === 'review' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {item.interactionType === 'review' ? 'Đánh giá' : 'Bình luận'}
                          </div>
                          <p className="text-sm text-slate-600 italic line-clamp-1 flex-1">
                            "{item.interactionType === 'review' ? (item as ReviewDTO).comment : (item as CommentDTO).content}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
                        {item.interactionType === 'review' && renderStars((item as ReviewDTO).rating)}
                        <button
                          onClick={() => (item.interactionType === 'review' ? toggleHideReview : toggleHideComment)(item.id)}
                          className={`p-2 rounded-lg border transition-all ${isHidden ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-slate-100'}`}
                        >
                          {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
