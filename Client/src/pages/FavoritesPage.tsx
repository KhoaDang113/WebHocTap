import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, ArrowRight, Loader2, AlertCircle, Heart } from "lucide-react";
import { useAuth, useCategories } from "@/hooks";
import type { CourseDTO, CategoryDTO } from "@/types";
import { interactionsApi } from "@/api/interactionsApi";
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
import { useMemo } from "react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function FavoritesPage() {
  const { user } = useAuth();
  
  const { data: categories = [] } = useCategories();
  
  const { 
    data: favoriteCourses = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await interactionsApi.getFavorites();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((cat: CategoryDTO) => [cat.id, cat.name])),
    [categories]
  );

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách khóa học yêu thích...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không thể tải dữ liệu</h2>
        <p className="mt-2 text-slate-500 max-w-md">
          Đã có lỗi xảy ra khi tải danh sách yêu thích. Vui lòng thử lại sau.
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
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-900">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-pink-500 fill-pink-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Khóa học <span className="text-pink-500">Yêu thích</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Danh sách các khóa học bạn đã đánh dấu quan tâm và muốn học trong tương lai.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Danh sách của bạn
            <span className="ml-3 text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full uppercase">
              {favoriteCourses.length} Khóa học
            </span>
          </h2>
        </div>

        {favoriteCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoriteCourses.map((course: CourseDTO) => (
              <Card key={course.id} className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white">
                <div className="absolute inset-x-0 top-0 z-30 aspect-video bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />
                
                {/* Heart Icon Overlay */}
                <div className="absolute top-3 right-3 z-40 bg-white/90 p-2 rounded-full shadow-sm">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </div>

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
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Chưa có khóa học yêu thích</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">
              Bạn chưa thêm bất kỳ khóa học nào vào danh sách yêu thích. Hãy khám phá các khóa học và lưu lại những nội dung bạn quan tâm nhé.
            </p>
            <Link to="/courses">
              <Button className="mt-8 bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 rounded-xl shadow-lg shadow-indigo-200">
                Khám phá khóa học
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
