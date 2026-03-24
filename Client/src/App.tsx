import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks";
import { Navbar, Footer } from "@/components";
import { ToastProvider } from "@/components/ui/Toast";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  ProfilePage,
  ChangePasswordPage,
  CoursesPage,
  CourseDetailPage,
  LearningPage,
  InstructorDashboardPage,
  InstructorCoursesPage,
  InstructorCreateLessonPage,
  InstructorLivePage,
  InstructorInteractionsPage,
  FavoritesPage,
} from "@/pages";
import LiveRoomPage from "@/pages/live/LiveRoomPage";
import AdminLayout from "@/components/admin/AdminLayout";
import { InstructorLayout } from "@/components/instructor/InstructorLayout";
import {
  AdminDashboardPage,
  AdminUserManagementPage,
  AdminCoursesPage,
  AdminLivePage,
  AdminCategoryPage,
  AdminLessonsPage,
  AdminCreateLessonPage,
  AdminQuizzesPage,
} from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Live Session standalone route (No Navbar, Fullscreen) */}
              <Route path="/live/:sessionId" element={<LiveRoomPage />} />

              {/* Admin routes - layout riêng, không có Navbar */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUserManagementPage />} />
                <Route path="categories" element={<AdminCategoryPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route
                  path="courses/:courseId/lessons/create"
                  element={<AdminCreateLessonPage />}
                />
                <Route path="lessons" element={<AdminLessonsPage />} />
                <Route path="quizzes" element={<AdminQuizzesPage />} />
                <Route path="live" element={<AdminLivePage />} />
              </Route>

              {/* Instructor routes - layout riêng */}
              <Route path="/instructor" element={<InstructorLayout />}>
                <Route path="dashboard" element={<InstructorDashboardPage />} />
                <Route path="courses" element={<InstructorCoursesPage />} />
                <Route
                  path="courses/:courseId/lessons/create"
                  element={<InstructorCreateLessonPage />}
                />
                <Route path="live" element={<InstructorLivePage />} />
                <Route path="interactions" element={<InstructorInteractionsPage />} />
              </Route>

              {/* Public routes - có Navbar */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route
                          path="/courses/:id"
                          element={<CourseDetailPage />}
                        />
                        <Route
                          path="/learn/:courseId"
                          element={<LearningPage />}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route
                          path="/change-password"
                          element={<ChangePasswordPage />}
                        />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
