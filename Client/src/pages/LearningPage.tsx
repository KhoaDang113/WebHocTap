import { useParams, Navigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCourse, useLessons, useEnrollmentStatus, useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, BookOpen, PlayCircle, ChevronLeft } from 'lucide-react'
import QuizView from '@/components/QuizView'

export default function LearningPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useCourse(courseId || '')

  const {
    data: lessons = [],
    isLoading: isLessonsLoading,
  } = useLessons(courseId || '')

  const {
    data: enrollmentStatus,
    isLoading: isEnrollmentLoading,
    isError: isEnrollmentError,
  } = useEnrollmentStatus(courseId)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isCourseLoading || isEnrollmentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Đang tải nội dung học...</p>
      </div>
    )
  }

  if (isCourseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-600" />
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy khóa học</h2>
        <Link to="/courses">
          <Button variant="outline" className="mt-2">
            Quay lại danh sách khóa học
          </Button>
        </Link>
      </div>
    )
  }

  const isEnrolled = !!enrollmentStatus?.isEnrolled

  if (!isEnrolled || isEnrollmentError) {
    return <Navigate to={`/courses/${course.id}`} replace />
  }

  const sortedLessons = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex)
  const activeLesson = activeQuizId
    ? null
    : sortedLessons.find((lesson) => lesson.id === activeLessonId) ||
      sortedLessons[0] ||
      null

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/courses/${course.id}`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Đang học
              </p>
              <h1 className="text-lg font-bold text-slate-900 line-clamp-1">
                {course.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-semibold text-slate-800">
                  Danh sách bài học
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {lessons.length} bài
              </span>
            </div>

            <div className="max-h-[70vh] overflow-y-auto py-2 text-sm">
              {isLessonsLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : sortedLessons.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Chưa có bài học nào trong khóa này.
                </div>
              ) : (
                sortedLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 ${
                      activeLesson && activeLesson.id === lesson.id && !activeQuizId
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setActiveLessonId(lesson.id)
                      setActiveQuizId(null)
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-grow">
                      <p className="text-[13px] font-semibold text-slate-800 line-clamp-2">
                        {lesson.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {lesson.content || 'Nội dung bài học'}
                      </p>
                    </div>
                    <PlayCircle className="h-4 w-4 text-slate-400" />
                  </div>
                ))
              )}

              {/* Mock Quiz Item for testing */}
              {sortedLessons.length > 0 && (
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 mt-2 border-t border-slate-100 ${
                    activeQuizId
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setActiveQuizId('mock-quiz-123') // Replace with actual quiz ID later
                    setActiveLessonId(null)
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xs font-semibold">
                    ❓
                  </div>
                  <div className="flex-grow">
                    <p className="text-[13px] font-semibold text-slate-800 line-clamp-2">
                      Bài kiểm tra kết thúc
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      Kiểm tra kiến thức khóa học
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {activeQuizId ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-120px)] flex flex-col">
              <QuizView quizId={activeQuizId} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {activeLesson && (activeLesson.videoUrl || activeLesson.imageUrl) && (
              <div className="aspect-video bg-black flex items-center justify-center">
                {activeLesson.videoUrl ? (
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : activeLesson.imageUrl ? (
                  <img
                    src={activeLesson.imageUrl}
                    alt={activeLesson.title}
                    className="w-full h-full object-contain bg-black"
                  />
                ) : null}
              </div>
            )}

            <div className="p-6 space-y-4 flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {activeLesson ? activeLesson.title : 'Chưa có bài học'}
              </h2>
              {activeLesson && activeLesson.content && (
                <div className="prose prose-slate max-w-none text-slate-700">
                  {activeLesson.content}
                </div>
              )}
            </div>
          </div>
          )}
        </section>
      </div>
    </div>
  )
}

