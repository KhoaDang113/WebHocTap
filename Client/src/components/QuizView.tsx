import { useState, useEffect, useRef } from 'react'
import { getQuizById, startQuiz, getQuizAttempt, submitQuiz } from '@/api/quizApi'
import type { QuizDTO, QuizAttemptDTO, SubmitQuizResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface QuizViewProps {
  quizId: string
}

export default function QuizView({ quizId }: QuizViewProps) {
  const [quiz, setQuiz] = useState<QuizDTO | null>(null)
  const [attempt, setAttempt] = useState<QuizAttemptDTO | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitQuizResponse | null>(null)
  
  const navigate = useNavigate()
  const hasSubmitted = useRef(false)

  // Initialization
  useEffect(() => {
    let isMounted = true

    const initQuiz = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch quiz details
        const quizRes = await getQuizById(quizId)
        if (isMounted) setQuiz(quizRes.data)

        // Try to resume attempt, fallback to start
        let attemptData: QuizAttemptDTO
        try {
          const attemptRes = await getQuizAttempt(quizId)
          attemptData = attemptRes.data
          
          if (attemptData.status === 'NOT_STARTED') {
             // If not started, explicitly call startQuiz
             const startRes = await startQuiz(quizId)
             attemptData = startRes.data
          }
        } catch (err: any) {
          if (err.response?.status === 404 || err.response?.status === 400) {
            const startRes = await startQuiz(quizId)
            attemptData = startRes.data
          } else {
            throw err
          }
        }

        if (isMounted) {
          if (attemptData.status === 'COMPLETED' || attemptData.status === 'EXPIRED' || attemptData.status === 'MAX_ATTEMPTS_REACHED') {
            hasSubmitted.current = true
          }
          
          setAttempt(attemptData)
          setRemainingTime(attemptData.remainingTime)
          
          if (hasSubmitted.current) {
            setResult({
              score: attemptData.score || 0,
              passed: (attemptData.score || 0) >= 5,
              correctAnswers: attemptData.correctAnswers || 0,
              totalQuestions: attemptData.totalQuestions || 0
            })
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Có lỗi xảy ra khi tải bài kiểm tra')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initQuiz()

    return () => {
      isMounted = false
    }
  }, [quizId])

  // UI Timer countdown (every 1s)
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0 || !attempt || hasSubmitted.current) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev !== null && prev > 0) return prev - 1
        return 0
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingTime, attempt])

  // Sync Timer with backend (every 10s)
  useEffect(() => {
    if (!attempt || hasSubmitted.current || remainingTime === null || remainingTime <= 0) return

    const syncTimer = setInterval(async () => {
      try {
        const res = await getQuizAttempt(quizId)
        if (res.data) {
          setRemainingTime(res.data.remainingTime)
          if (res.data.status === 'COMPLETED' || res.data.status === 'EXPIRED') {
            hasSubmitted.current = true
            setRemainingTime(0)
          }
        }
      } catch (e) {
        console.error('Lỗi đồng bộ thời gian:', e)
      }
    }, 10000)

    return () => clearInterval(syncTimer)
  }, [quizId, attempt, remainingTime])

  // Handle Auto Submit when time reaches 0
  useEffect(() => {
    if (remainingTime === 0 && remainingTime !== null && !hasSubmitted.current && !isSubmitting && attempt && attempt.status === 'IN_PROGRESS') {
      handleAutoSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime, isSubmitting, attempt])

  const handleAutoSubmit = async () => {
    await performSubmit()
  }

  const handleManualSubmit = async () => {
    if (confirm('Bạn có chắc chắn muốn nộp bài?')) {
      await performSubmit()
    }
  }

  const performSubmit = async () => {
    if (isSubmitting || hasSubmitted.current) return
    
    setIsSubmitting(true)
    hasSubmitted.current = true // Mark to prevent duplicate calls
    try {
      // Send userAnswers object directly as the map
      const res = await submitQuiz(quizId, { answers: userAnswers })
      
      // Navigate back to course learning page with result
      setResult(res.data)
      setRemainingTime(0)
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nộp bài')
      // revert submitted status if api fails so they can retry, but usually if time is up, the backend handles it.
      if (remainingTime && remainingTime > 0) {
        hasSubmitted.current = false
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    if (remainingTime === 0 || hasSubmitted.current) return
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Đang tải bài kiểm tra...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="h-10 w-10 text-red-600" />
        <p className="text-slate-800 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  if (!quiz) return null

  const isSubmitDisabled = remainingTime === 0 || isSubmitting || hasSubmitted.current || result !== null

  return (
    <div className="flex flex-col h-full">
      {/* Quiz Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{quiz.title}</h2>
            {quiz.description && <p className="text-sm text-slate-500">{quiz.description}</p>}
          </div>
        {!result && (
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold ${
              remainingTime !== null && remainingTime < 60 ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span>{remainingTime !== null ? formatTime(remainingTime) : '--:--'}</span>
            </div>
            <Button 
              onClick={handleManualSubmit}
              disabled={isSubmitDisabled}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Nộp bài
            </Button>
          </div>
        )}
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-slate-50">
        {result ? (
          <div className="max-w-3xl mx-auto mt-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${result.passed ? 'text-green-500' : 'text-red-500'}`} />
            <h3 className="text-2xl font-bold mb-2">
              {result.passed ? 'Chúc mừng! Bạn đã vượt qua' : 'Rất tiếc! Bạn chưa đạt'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-slate-500 text-sm mb-1">Điểm số</p>
                <p className="text-2xl font-bold text-slate-800">{result.score}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-slate-500 text-sm mb-1">Số câu đúng</p>
                <p className="text-2xl font-bold text-slate-800">
                  {result.correctAnswers} / {result.totalQuestions}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button 
                onClick={() => quiz?.courseId && navigate(`/courses/${quiz.courseId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
              >
                Tiếp tục bài học
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {quiz.questions?.map((question, index) => (
              <div key={question.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-medium text-slate-800 mb-4">
                  <span className="text-indigo-600 font-bold mr-2">Câu {index + 1}:</span>
                  {question.content}
                </h4>
                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <label 
                      key={answer.id}
                      className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${
                        userAnswers[question.id] === answer.id 
                          ? 'bg-indigo-50 border-indigo-200' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={answer.id}
                        checked={userAnswers[question.id] === answer.id}
                        onChange={() => handleAnswerSelect(question.id, answer.id)}
                        disabled={isSubmitDisabled}
                        className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-slate-700">{answer.content}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
