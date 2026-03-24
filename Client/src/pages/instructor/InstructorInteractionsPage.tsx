import { useState, useMemo } from "react";
import {
  Star,
  Search,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useInstructorReviews,
  useInstructorComments,
  useToggleHideReview,
  useToggleHideComment
} from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";

export default function InstructorInteractionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: reviews = [], isLoading: isReviewsLoading, isError: isReviewsError } = useInstructorReviews();
  const { data: comments = [], isLoading: isCommentsLoading, isError: isCommentsError } = useInstructorComments();

  const { mutate: toggleHideReview } = useToggleHideReview();
  const { mutate: toggleHideComment } = useToggleHideComment();

  // Combine and sort by date
  const allInteractions = useMemo(() => {
    const combined = [
      ...reviews.map(r => ({ ...r, interactionType: 'review' as const })),
      ...comments.map(c => ({ ...c, interactionType: 'comment' as const }))
    ];

    return combined.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews, comments]);

  const filteredInteractions = allInteractions.filter(item => {
    const searchContent = item.interactionType === 'review'
      ? (item as any).comment
      : (item as any).content;

    return (
      (searchContent?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.userFullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.courseTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const handleToggleHide = (item: any) => {
    if (item.interactionType === 'review') {
      toggleHideReview(item.id);
    } else {
      toggleHideComment(item.id);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
          />
        ))}
      </div>
    );
  };

  const isLoading = isReviewsLoading || isCommentsLoading;
  const isError = isReviewsError || isCommentsError;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Phản hồi</h1>
          <p className="text-slate-500 font-medium mt-1">Ẩn/hiện đánh giá và bình luận từ học viên.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung, tên học viên hoặc khóa học..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="relative">
        {isError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-center gap-3 font-bold animate-shake uppercase tracking-tight">
            <AlertCircle size={20} />
            Lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {(isLoading ? Array(5).fill(null) : filteredInteractions).map((item, i) => {
              const isHidden = item?.isHidden || (item as any)?.hidden;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={item?.id || `skeleton-${i}`}
                  className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all ${isHidden ? 'bg-slate-50/70 border-dashed opacity-75' : ''}`}
                >
                  {!item ? (
                    <div className="flex gap-6 animate-pulse">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                        <div className="h-10 bg-slate-50 rounded-2xl"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 flex md:flex-col items-center gap-4">
                        <div className="relative">
                          <img
                            src={item.userAvatar || `https://ui-avatars.com/api/?name=${item.userFullName}&background=6366f1&color=fff`}
                            alt=""
                            className={`w-16 h-16 rounded-[24px] object-cover ring-4 ring-slate-50 shadow-sm ${isHidden ? 'grayscale' : ''}`}
                          />
                          {isHidden && (
                            <div className="absolute inset-0 bg-slate-900/40 rounded-[24px] flex items-center justify-center">
                              <EyeOff size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.interactionType === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.interactionType === 'review' ? 'Đánh giá' : 'Bình luận'}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                              {item.userFullName}
                              {isHidden && <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">Đang ẩn</span>}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                              <Clock size={12} />
                              {item.createdAt ? format(new Date(item.createdAt), 'dd MMMM, yyyy', { locale: vi }) : '---'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleHide(item)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${isHidden ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {isHidden ? (
                              <><Eye size={16} /> Hiện</>
                            ) : (
                              <><EyeOff size={16} /> Ẩn</>
                            )}
                          </button>
                        </div>

                        <div className={`p-5 rounded-[24px] border ${isHidden ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-50/80 border-slate-100/50'}`}>
                          {item.interactionType === 'review' && (
                            <div className="mb-3">
                              {renderStars((item as any).rating)}
                            </div>
                          )}
                          <p className={`font-medium leading-relaxed italic ${isHidden ? 'text-slate-400' : 'text-slate-700'}`}>
                            "{item.interactionType === 'review' ? (item as any).comment : (item as any).content}"
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                            <BookOpen size={14} className="text-indigo-600" />
                            <span className="text-xs font-bold text-slate-600">{item.courseTitle}</span>
                          </div>
                          {item.interactionType === 'comment' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl">
                              <CheckCircle size={14} className="text-green-600" />
                              <span className="text-xs font-bold text-green-700">Bài: {(item as any).lessonTitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!isLoading && filteredInteractions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800">Không tìm thấy phản hồi nào</p>
            <p className="text-slate-500 font-medium mt-2">Thử thay đổi từ khóa tìm kiếm của bạn</p>
          </div>
        )}
      </div>
    </div>
  );
}
