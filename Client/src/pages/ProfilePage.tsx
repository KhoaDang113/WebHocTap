import { useState, useEffect, useRef } from "react";
import { useAuth, useMyAverageScore } from "@/hooks";
import { Edit, Save, X, Camera, Mail, User as UserIcon, Calendar, MapPin, Phone, BookOpen, Clock, ShieldCheck, PlayCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getMyCourses } from "@/api/enrollmentApi";
import type { CourseDTO } from "@/types";

export function ProfilePage() {
  const { user } = useAuth();
  const { data: averageScore = 0 } = useMyAverageScore();
  const location = useLocation();
  const coursesRef = useRef<HTMLDivElement>(null);
  
  // Trạng thái cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  
  // Dữ liệu mock cho profile
  const [profileData, setProfileData] = useState({
    name: user?.username?.split('@')[0] || "Nguyễn Văn An",
    email: user?.username || "an.nv@edu.vn",
    role: user?.role === "STUDENT" ? "Sinh viên" : user?.role === "TEACHER" ? "Giảng viên" : user?.role === "ADMIN" ? "Admin" : "Sinh viên",
    faculty: "Công nghệ thông tin",
    studentId: "SV2021001",
    dateOfBirth: "15/05/2003",
    phone: "0345678912",
    address: "Ký túc xá khu A, ĐHQG HCM",
    avatar: "https://i.pravatar.cc/150?u=1",
    joinDate: "05/09/2021",
    status: "Đang học"
  });

  // State lưu dữ liệu form khi chỉnh sửa
  const [formData, setFormData] = useState({ ...profileData });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfileData(formData);
    setIsEditing(false);
    // TODO: Gọi API cập nhật thông tin user tại đây
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const [myCourses, setMyCourses] = useState<CourseDTO[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const courses = await getMyCourses();
        setMyCourses(courses);
      } catch (error) {
        console.error("Failed to fetch my courses", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    if (user && !isEditing) {
      fetchCourses();
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (location.hash === '#my-courses' && coursesRef.current) {
      coursesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f19] pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hồ sơ cá nhân</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
          
          {/* Cover Photo */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-10 pb-8">
            {/* Avatar & Action Button */}
            <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-md">
                  <img 
                    src={profileData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" title="Đang hoạt động"></div>
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg font-medium transition-colors border border-indigo-200 dark:border-indigo-500/20 shadow-sm"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                  >
                    <X size={18} />
                    <span className="hidden sm:inline">Hủy</span>
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg font-medium shadow-sm transition-colors"
                  >
                    <Save size={18} />
                    <span className="hidden sm:inline">Lưu thay đổi</span>
                  </button>
                </div>
              )}
            </div>

            {/* Basic Info Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold border border-indigo-200 dark:border-indigo-500/30">
                  {profileData.role}
                </span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={16} />
                  {profileData.faculty}
                </span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-green-500" />
                  MSSV: {profileData.studentId}
                </span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 mb-8" />

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Cột 1 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Thông tin cá nhân
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <UserIcon size={16} /> Họ và tên
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-shadow"
                      />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">{profileData.name}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <Calendar size={16} /> Ngày sinh
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-shadow"
                      />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">{profileData.dateOfBirth}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <MapPin size={16} /> Địa chỉ liên lạc
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-shadow"
                      />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">{profileData.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Thông tin liên hệ
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <Mail size={16} /> Email
                    </label>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profileData.email}
                      {isEditing && <span className="ml-2 text-xs text-amber-600 dark:text-amber-500 font-normal">* Email do nhà trường cấp không thể thay đổi</span>}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <Phone size={16} /> Số điện thoại
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-shadow"
                      />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">{profileData.phone}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                      <Clock size={16} /> Ngày tham gia
                    </label>
                    <p className="font-medium text-slate-900 dark:text-white">{profileData.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Course Progress / Activity Summary (Only for Students) */}
        {!isEditing && user?.role === 'STUDENT' && (
          <div className="space-y-6">
            <div ref={coursesRef} id="learning-overview" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 scroll-mt-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tổng quan học tập</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Khóa học đã đăng ký</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{myCourses.length}</div>
                </div>
                
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-100/20">
                  <div className="text-green-600 dark:text-green-400 font-semibold mb-1">Khóa học hoàn thành</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">0</div>
                </div>
                
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                  <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">Điểm trung bình</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{averageScore.toFixed(1)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mt-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="text-indigo-600" />
                Khóa học của tôi
              </h3>
              
              {loadingCourses ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <Link to={`/courses/${course.id}`} key={course.id} className="block group">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all h-full flex flex-col bg-white dark:bg-slate-800/50">
                        <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-800/80">Không có ảnh</div>
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                          {course.isPrivate && (
                            <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">Ẩn</span>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h4>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{course.description || "Danh mục khóa học"}</p>
                          
                          {/* Learning Progress Bar */}
                          <div className="mt-4 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(course.progressPercent || 0)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300" 
                                style={{ width: `${course.progressPercent || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                              <PlayCircle size={18} className="mr-1.5" /> Tiếp tục học
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Chưa tham gia khóa học nào</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Bạn chưa đăng ký khóa học nào. Khám phá hàng trăm khóa học thú vị trên nền tảng ngay hôm nay!</p>
                  <Link to="/courses" className="mt-6 inline-flex items-center justify-center font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg shadow-md transition-colors hover:shadow-lg">
                    Khám phá khóa học
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
