import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Clock, 
  PlayCircle, 
  User, 
  BookOpen, 
  Loader2,
  AlertCircle,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import { useCourse, useLessons, useCategories, useEnrollmentStatus, useEnrollInCourse, useAuth, useCourseLiveSessions } from "@/hooks";
import type { LiveSessionDTO } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ReviewSystem } from "@/components/ui/ReviewSystem";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    data: course, 
    isLoading: isCourseLoading, 
    isError: isCourseError 
  } = useCourse(id || "");
  
  const { 
    data: lessons = [], 
    isLoading: isLessonsLoading 
  } = useLessons(id || "");
  
  const { data: categories = [] } = useCategories();

  const {
    data: enrollmentStatus,
    isLoading: isEnrollmentLoading,
  } = useEnrollmentStatus(id);

  const {
    mutateAsync: enroll,
    isPending: isEnrollLoading,
  } = useEnrollInCourse(id);

  const isEnrolled = !!enrollmentStatus?.isEnrolled;

  const { data: liveSessions = [] } = useCourseLiveSessions(id || "", { enabled: isEnrolled || user?.role === 'ADMIN' || user?.role === 'TEACHER' });
  const activeSessions = liveSessions.filter((s: LiveSessionDTO) => s.status === 'ACTIVE');

  const handlePrimaryAction = async () => {
    if (!id) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    try {
      await enroll();
      navigate(`/learn/${id}`);
    } catch {
      // error đã được interceptor / backend xử lý message
    }
  };

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (isCourseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy khóa học</h2>
        <p className="text-slate-500 max-w-md">
          Có vẻ như khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
        </p>
        <Link to="/courses">
          <Button variant="outline" className="mt-2">
            Quay lại danh sách khóa học
          </Button>
        </Link>
      </div>
    );
  }

  const category = categories.find(c => c.id === course.categoryId);
  const sortedLessons = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link to="/courses" className="hover:text-indigo-600 transition-colors">Khóa học</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900 truncate">{course.title}</span>
          </nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none px-3 py-1">
                  {category?.name || "Chưa phân loại"}
                </Badge>
                {course.status === 'PUBLISHED' && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1">
                    Mới nhất
                  </Badge>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                  {course.title}
                </h1>
                {user && <FavoriteButton courseId={id || ""} />}
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Giảng viên</span>
                    <span className="text-sm font-bold text-slate-800">{course.instructor || "Đội ngũ WebHocTap"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bài học</span>
                    <span className="text-sm font-bold text-slate-800">{lessons.length} bài</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cập nhật</span>
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="space-y-10">
                
                {/* Live Session Banner */}
                {activeSessions.length > 0 && (
                  <section>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full shrink-0">
                          <Video className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-900 mb-1">Đang có lớp học Live!</h3>
                          <p className="text-blue-700 text-sm">Giảng viên đang livestream phân tích nội dung chuyên sâu. Hãy tham gia ngay để không bỏ lỡ.</p>
                          <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-100/50 inline-block px-2 py-1 rounded">
                            Chủ đề: {activeSessions[0].title}
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/live/${activeSessions[0].id}`}
                        target="_blank"
                        className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-md whitespace-nowrap text-center"
                      >
                        Tham gia phòng Live
                      </Link>
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="h-8 w-1.5 bg-indigo-600 rounded-full"></span>
                    Mô tả khóa học
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    {course.description || "Khóa học này chưa có mô tả chi tiết."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="h-8 w-1.5 bg-indigo-600 rounded-full"></span>
                      Nội dung bài học
                    </h2>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {lessons.length} bài đã sẵn sàng
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {isLessonsLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      sortedLessons.map((lesson, index) => (
                        <div 
                          key={lesson.id}
                          className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                          onClick={handlePrimaryAction}
                        >
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold text-slate-400 bg-slate-50 rounded-xl group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                              {lesson.content || "Nhấn để xem chi tiết bài học"}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors">
                            <PlayCircle className="h-6 w-6" />
                          </div>
                        </div>
                      ))
                    )}
                    
                    {!isLessonsLoading && lessons.length === 0 && (
                      <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Hiện tại chưa có bài học nào cho khóa này.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Review Section */}
              <div className="mt-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <ReviewSystem courseId={id || ""} isEnrolled={isEnrolled} />
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-4 h-fit">
              <Card className="sticky top-24 overflow-hidden border-slate-200 shadow-xl rounded-3xl group">
                <div className="relative aspect-video overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <span className="text-white font-bold text-lg flex items-center gap-2 self-start bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <PlayCircle className="h-5 w-5" />
                      Xem Trailer
                    </span>
                  </div>
                </div>

                <CardHeader className="pt-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {course.price > 0 ? Number(course.price).toLocaleString('vi-VN') + ' đ' : 'Miễn phí'}
                    </span>
                    {course.price > 0 && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        {(course.price * 1.5).toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                  <CardTitle className="sr-only">Hành động</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                      disabled={isEnrollmentLoading || isEnrollLoading}
                      onClick={handlePrimaryAction}
                    >
                      {isEnrollmentLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang kiểm tra...
                        </span>
                      ) : isEnrollLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang đăng ký...
                        </span>
                      ) : isEnrolled ? (
                        "Vào học"
                      ) : course.price > 0 ? (
                        "Đăng ký khóa học"
                      ) : (
                        "Bắt đầu học ngay"
                      )}
                    </Button>
                    <Button variant="outline" className="w-full h-12 border-slate-200 hover:bg-slate-50 font-bold transition-all">
                      Trắc nghiệm
                    </Button>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       Khóa học bao gồm:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <PlayCircle className="h-4 w-4 text-indigo-500" />
                        <span>Truy cập trọn đời</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                        <span>Chứng chỉ hoàn thành</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <span>Bảo hành hoàn tiền 30 ngày</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
