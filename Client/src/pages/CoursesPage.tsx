import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useCourses, useCategories } from "@/hooks";
import type { CourseDTO, CategoryDTO } from "@/types";
import { enrollByCode } from "@/api/enrollmentApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses = [], isLoading: isCoursesLoading, isError: isCoursesError } = useCourses({ enabled: true });
  const { data: categories = [] } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoinCourse = async () => {
    if (!inviteCode.trim()) return;
    try {
      setJoinLoading(true);
      const res = await enrollByCode(inviteCode.trim());
      navigate(`/courses/${(res.data as any).courseId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể tham gia khóa học. Mã không hợp lệ hoặc bạn đã tham gia.");
    } finally {
      setJoinLoading(false);
      setShowJoinModal(false);
      setInviteCode("");
    }
  };

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((cat: CategoryDTO) => [cat.id, cat.name])),
    [categories]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course: CourseDTO) => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || course.categoryId === selectedCategory;
      const isPublished = course.status === "PUBLISHED";
      const isPublic = !course.isPrivate;
      
      return matchesSearch && matchesCategory && isPublished && isPublic;
    });
  }, [courses, searchTerm, selectedCategory]);

  if (isCoursesLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  if (isCoursesError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không thể tải dữ liệu</h2>
        <p className="mt-2 text-slate-500 max-w-md">
          Đã có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center text-slate-900">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Khám phá <span className="text-indigo-600">tương lai</span> của bạn
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Nâng cao kỹ năng với các khóa học chất lượng từ những giảng viên giàu kinh nghiệm. 
            Học mọi lúc, mọi nơi trên mọi thiết bị.
          </p>

          {/* Search and Filter */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl shadow-xl border border-slate-100">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-12 pr-4 py-3 outline-none text-slate-700 font-medium bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:w-px h-auto md:h-10 bg-slate-200 my-auto" />
              <div className="md:w-56 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  className="w-full pl-12 pr-8 py-3 outline-none text-slate-700 appearance-none bg-transparent font-medium cursor-pointer"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">Tất cả danh mục</option>
                  {categories.map((cat: CategoryDTO) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {selectedCategory === "ALL" ? "Tất cả khóa học" : categoryMap[selectedCategory]}
            <span className="ml-3 text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full uppercase">
              {filteredCourses.length} Kết quả
            </span>
          </h2>
          <Button 
            variant="outline" 
            className="text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 font-semibold"
            onClick={() => setShowJoinModal(true)}
          >
            Tham gia bằng mã
          </Button>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course: CourseDTO) => (
              <Card key={course.id} className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white">
                <div className="absolute inset-x-0 top-0 z-30 aspect-video bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="relative z-20 aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative z-20 aspect-video w-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                    <BookOpen size={40} className="text-slate-300 mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">No Preview</span>
                  </div>
                )}
                <CardHeader className="p-5">
                  <CardAction>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100">
                      {categoryMap[course.categoryId] || "Chưa phân loại"}
                    </Badge>
                    <span className="text-sm font-bold text-slate-900">
                      {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                    </span>
                  </CardAction>
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 h-10 text-slate-500 mt-1">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-5 pt-2">
                  <Link to={`/courses/${course.id}`} className="w-full">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2 group/btn">
                      <span>Xem khóa học</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Không tìm thấy khóa học nào</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả khóa học.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); }}
              className="mt-8 text-indigo-600 font-bold hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Join Course Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tham gia bằng mã</h3>
            <p className="text-slate-500 text-sm mb-6">
              Nhập mã tham gia gồm 6-8 ký tự do giảng viên hoặc quản trị viên cung cấp để tham gia khóa học.
            </p>
            <input
              type="text"
              placeholder="VD: A1B2C3D4"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-center uppercase tracking-widest mb-6"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => { setShowJoinModal(false); setInviteCode(""); }}
                disabled={joinLoading}
              >
                Hủy
              </Button>
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleJoinCourse}
                disabled={!inviteCode.trim() || joinLoading}
              >
                {joinLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Tham gia ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
