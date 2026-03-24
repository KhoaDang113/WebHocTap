import { useParams, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCourse, useLessons, useEnrollmentStatus, useAuth, useCourseProgress, useCompleteLesson, useCourseQuizzes } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, BookOpen, PlayCircle, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { CommentSection } from '@/components/ui/CommentSection'

// Safe toast fallback
const toast = {
  success: (msg: string) => console.log('Toast Success:', msg),
  error: (msg: string) => console.error('Toast Error:', msg)
}

export default function LearningPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState<{
    quizTitle: string;
    quizResult: { 
      passed: boolean; 
      score: number; 
      correctAnswers: number; 
      totalQuestions: number;
      maxAttempts?: number;
      attemptCount?: number;
      isMaxAttempts?: boolean;
    };
  } | null>(null);

  useEffect(() => {
    if (location.state?.showResultMode) {
      setShowResult({
        quizTitle: location.state.quizTitle,
        quizResult: location.state.quizResult
      });
      // Consume state so it doesn't pop up again on refresh
      window.history.replaceState({}, '')
    }
  }, [location]);

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

  const {
    data: progress,
  } = useCourseProgress(courseId)

  const {
    data: quizzesData,
    isLoading: isQuizzesLoading
  } = useCourseQuizzes(courseId || '')

  const completeLessonMutation = useCompleteLesson(courseId)

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
  const activeLesson = sortedLessons.find((lesson) => lesson.id === activeLessonId) ||
      sortedLessons[0] ||
      null

  const completedLessonIds = progress?.completedLessonIds || []
  const progressPercent = progress?.progressPercent || 0

  const handleCompleteLesson = async () => {
    if (!activeLesson) return
    try {
      await completeLessonMutation.mutateAsync(activeLesson.id)
      toast?.success('Đã hoàn thành bài học!')
    } catch (error) {
      console.error('Failed to complete lesson', error)
      toast?.error('Không thể hoàn thành bài học')
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
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

          <div className="flex items-center gap-4 flex-1 max-w-xs md:max-w-md">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-slate-700 min-w-[3rem] text-right">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {!showResult && (
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
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
                sortedLessons.map((lesson, index) => {
                  const isCompleted = completedLessonIds.includes(lesson.id)
                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 ${
                        activeLesson && activeLesson.id === lesson.id
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setActiveLessonId(lesson.id)
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className={`text-[13px] font-semibold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'} line-clamp-2`}>
                          {lesson.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {lesson.content || 'Nội dung bài học'}
                        </p>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  )
                })
              )}

              {/* Quizzes List */}
              {isQuizzesLoading ? (
                 <div className="flex justify-center p-3">
                   <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                 </div>
              ) : (
                quizzesData?.filter(q => q.status === 'PUBLIC')?.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 mt-2 border-t border-slate-100 border-transparent hover:bg-slate-50"
                    onClick={() => {
                      navigate(`/quiz/${courseId}/${quiz.id}`)
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xs font-semibold">
                      ❓
                    </div>
                    <div className="flex-grow">
                      <p className="text-[13px] font-semibold text-slate-800 line-clamp-2">
                        {quiz.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {quiz.timeLimit} giây
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
        )}

        <section className={showResult ? "lg:col-span-12" : "lg:col-span-9"}>
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

              {/* Complete Lesson Button */}
              {activeLesson && (
                <div className="border-t border-slate-100 pt-6 mt-6 flex justify-end">
                  <Button
                    onClick={handleCompleteLesson}
                    disabled={completedLessonIds.includes(activeLesson.id) || completeLessonMutation.isPending}
                    className={`${
                      completedLessonIds.includes(activeLesson.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {completeLessonMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : completedLessonIds.includes(activeLesson.id) ? (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    ) : null}
                    {completedLessonIds.includes(activeLesson.id)
                      ? 'Đã hoàn thành'
                      : 'Hoàn thành bài học'}
                  </Button>
                </div>
              )}

              {/* Comments Section */}
              {activeLesson && (
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <CommentSection 
                    courseId={course.id}
                    lessonId={activeLesson.id} 
                    instructorUsername={course.instructor}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Quiz Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            {showResult.quizResult.isMaxAttempts ? (
              <AlertCircle className="w-20 h-20 mb-4 text-red-500" />
            ) : (
              <CheckCircle2 className={`w-20 h-20 mb-4 ${showResult.quizResult.passed ? 'text-green-500' : 'text-emerald-500'}`} />
            )}
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {showResult.quizResult.isMaxAttempts ? "Hết lượt làm bài" : "Kết quả bài thi"}
            </h3>
            <p className="text-slate-500 mb-6 font-medium line-clamp-2">{showResult.quizTitle}</p>
            
            {showResult.quizResult.isMaxAttempts ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 w-full">
                <p className="text-red-700 font-medium">
                  Bạn đã sử dụng hết {showResult.quizResult.maxAttempts} lượt làm bài cho bài thi này.
                </p>
                <p className="text-red-600/70 text-sm mt-1">
                  Điểm cao nhất sẽ được ghi nhận vào hệ thống.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-indigo-600/80 text-sm mb-1 uppercase tracking-wider font-bold">Điểm số</p>
                  <p className="text-3xl font-black text-indigo-700">{showResult.quizResult.score}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-bold">Trả lời đúng</p>
                  <p className="text-3xl font-black text-slate-800">
                    {showResult.quizResult.correctAnswers}<span className="text-xl text-slate-400">/{showResult.quizResult.totalQuestions}</span>
                  </p>
                </div>
              </div>
            )}
            
            {!showResult.quizResult.isMaxAttempts && showResult.quizResult.maxAttempts && (
               <p className="text-slate-400 text-xs mb-4 italic">
                  Lượt làm bài: {showResult.quizResult.attemptCount}/{showResult.quizResult.maxAttempts}
               </p>
            )}
            
            <Button 
              onClick={() => setShowResult(null)} 
              className="w-full bg-slate-800 hover:bg-slate-900 h-12 font-bold shadow-lg text-base"
            >
              Quay lại bài học
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

