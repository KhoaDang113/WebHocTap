import { Link } from 'react-router-dom'
import { useCourses } from '@/hooks/useCourses'
import { useCategories } from '@/hooks/useCategories'
import { 
  BookOpen, 
  ArrowRight, 
  Star, 
  TrendingUp 
} from 'lucide-react'
import type { CourseDTO, CategoryDTO } from '@/types'

const HomePage = () => {
  const { data: courses, isLoading: isCoursesLoading } = useCourses()
  const { data: categories, isLoading: isCategoriesLoading } = useCategories()

  // Filter for published and public courses
  const publicCourses = courses?.filter((course: CourseDTO) => course.status === 'PUBLISHED' && !course.isPrivate) || []

  // Limit to top 4 popular courses (mocking popularity by taking first 4 for now)
  const popularCourses = publicCourses.slice(0, 4)
  
  // Limit to top 6 categories
  const topCategories = categories?.slice(0, 6) || []

  return (
    <div className="bg-slate-50 dark:bg-[#0b0c10] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-[#0b0c10] dark:to-[#0b0c10] pt-24 pb-16 sm:pt-28 sm:pb-24">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/10 dark:[mask-image:linear-gradient(0deg,#0b0c10,rgba(11,12,16,0.6))]" />
        
        {/* Glowing Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6">
                <TrendingUp size={14} /> Nâng tầm tri thức cùng WebHocTap
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Học Tập <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">Trực Tuyến</span> <br />
                Mọi Lúc, Mọi Nơi
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu. Phát triển kỹ năng của bạn và mở khóa những cơ hội mới.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link 
                  to="/courses" 
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 group"
                >
                  Khám phá khóa học
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-white font-semibold rounded-xl transition-all shadow-sm"
                >
                  Đăng ký ngay
                </Link>
              </div>


            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Học tập trực tuyến" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Cards Removed */}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Popular Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Khóa học phổ biến</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Những khóa học được nhiều học viên lựa chọn nhất</p>
            </div>
            <Link to="/courses" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-500 font-semibold text-sm">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          {isCoursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                    <div className="pt-4 flex justify-between">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCourses.map((course: CourseDTO) => (
                <Link 
                  key={course.id} 
                  to={`/courses/${course.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <BookOpen size={40} className="text-slate-300 dark:text-slate-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">No Preview</span>
                      </div>
                    )}
                  </div>

                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {course.averageRating || 0}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    
                    {course.instructor && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">By {course.instructor}</p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} đ`}
                      </p>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                        Xem chi tiết <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">Chưa có khóa học nào được hiển thị.</div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Danh mục khóa học</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Được phân loại theo các chủ đề được quan tâm nhiều nhất</p>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-white dark:bg-slate-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topCategories.map((category: CategoryDTO) => (
                <Link 
                  key={category.id} 
                  to={`/courses?category=${category.id}`}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-md hover:border-indigo-500/20 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">Chưa có danh mục nào.</div>
          )}
        </div>
      </section>


    </div>
  )
}

export default HomePage

