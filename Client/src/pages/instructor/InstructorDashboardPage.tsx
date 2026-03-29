import { useQuery } from "@tanstack/react-query";
import { instructorApi } from "@/api/instructorApi";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Star, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks";
import { Navigate } from "react-router-dom";

export function InstructorDashboardPage() {
  const { user } = useAuth();

  const isTeacher = user?.role === "TEACHER";

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["instructor", "stats"],
    queryFn: async () => {
      const response = await instructorApi.getStats();
      return response.data.data;
    },
    enabled: !!user && isTeacher, // Chỉ fetch khi có user và là giáo viên
  });

  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["instructor", "students"],
    queryFn: async () => {
      const response = await instructorApi.getStudents();
      return response.data.data;
    },
    enabled: !!user && isTeacher,
  });

  // Protect route
  if (!user || user.role !== "TEACHER") {
    return <Navigate to="/" replace />;
  }

  if (isStatsLoading || isStudentsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = statsData || {
    totalCourses: 0,
    totalStudents: 0,
    totalReviews: 0,
    averageRating: 0,
  };
  const students = studentsData || [];

  const statCards = [
    {
      title: "Khóa học của tôi",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng học viên",
      value: stats.totalStudents,
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Đánh giá trung bình",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Tổng đánh giá",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Giảng viên
        </h1>
        <p className="text-slate-500 mt-2">
          Theo dõi và quản lý các khóa học, học viên của bạn.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-slate-100 shadow-sm border">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Students List */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Học viên của bạn ({students.length})
      </h2>
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Học viên</th>
                <th className="px-4 py-3 font-medium">Khóa học</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Ngày đăng ký
                </th>
                <th className="px-6 py-4 font-medium text-center">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Chưa có học viên nào đăng ký khóa học của bạn
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr
                    key={`${student.userId}-${student.courseId}-${idx}`}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || "User")}&background=random`}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-full bg-slate-100"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {student.courseTitle}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(student.enrolledAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-8">
                          {Math.round(student.progressPercent)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
