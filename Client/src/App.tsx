import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks'
import { Navbar } from '@/components'
import { HomePage, LoginPage, RegisterPage, NotFoundPage, ProfilePage, ChangePasswordPage, CoursesPage, CourseDetailPage, LearningPage } from '@/pages'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  AdminDashboardPage,
  AdminUserManagementPage,
  AdminCoursesPage,
  AdminLivePage,
  AdminSettingsPage,
  AdminCategoryPage,
  AdminLessonsPage,
  AdminCreateLessonPage,
} from '@/pages/admin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Admin routes - layout riêng, không có Navbar */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUserManagementPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="courses/:courseId/lessons/create" element={<AdminCreateLessonPage />} />
              <Route path="lessons" element={<AdminLessonsPage />} />
              <Route path="live" element={<AdminLivePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
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
                      <Route path="/courses/:id" element={<CourseDetailPage />} />
                      <Route path="/learn/:courseId" element={<LearningPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/change-password" element={<ChangePasswordPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
