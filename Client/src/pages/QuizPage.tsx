import { useParams, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import QuizView from '@/components/QuizView'

export function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!quizId || !courseId) {
    return <Navigate to="/courses" replace />
  }

  // The QuizPage has no Sidebar and is completely standalone!
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header bar only for Navigation back  */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/learn/${courseId}`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Đang thi trắc nghiệm
            </p>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Content Area */}
      <div className="h-[calc(100vh-65px)] flex flex-col">
        <QuizView quizId={quizId} />
      </div>
    </div>
  )
}
