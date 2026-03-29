import { useState, useEffect } from 'react'
import { History, Search, Trash2, Loader2, User, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllAttempts, deleteAttempt } from '@/api/quizApi'
import type { QuizAttemptHistoryResponse } from '@/types'

export default function AdminQuizAttemptsPage() {
  const [attempts, setAttempts] = useState<QuizAttemptHistoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateString))
    } catch (e) {
      return dateString
    }
  }

  const fetchAttempts = async () => {
    setIsLoading(true)
    try {
      const res = await getAllAttempts()
      setAttempts(res.data)
    } catch (error) {
      console.error('Lỗi tải lịch sử làm bài:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttempts()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lịch sử làm bài này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteAttempt(id)
        setAttempts(prev => prev.filter(a => a.id !== id))
      } catch (error) {
        alert('Lỗi khi xóa lịch sử làm bài')
      }
    }
  }

  const filteredAttempts = attempts.filter(a =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
    a.courseTitle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="text-indigo-600" />
          Lịch sử làm bài thi
        </h1>
        <p className="text-slate-500 mt-1">Theo dõi và quản lý quá trình thi cử của tất cả sinh viên.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên SV, MSSV hoặc tên bài tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Sinh viên</th>
                <th className="px-6 py-4 font-medium">Bài thi / Khóa học</th>
                <th className="px-6 py-4 font-medium">Kết quả</th>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy lịch sử nào
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{attempt.fullName}</p>
                          <p className="text-xs text-slate-500">@{attempt.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <BookOpen size={14} className="text-slate-400" />
                          {attempt.quizTitle}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">{attempt.courseTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {attempt.submitted ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${attempt.score && attempt.score >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                              {attempt.score?.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              ({attempt.correctAnswers}/{attempt.totalQuestions})
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                            Hoàn thành
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase w-fit">
                            Đang làm / Bỏ dở
                          </span>
                          <span className="text-[10px] text-slate-400 italic">Chưa có điểm</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-slate-600 gap-1">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {formatDate(attempt.startTime)}
                        </span>
                        {attempt.submitted && (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <CheckCircle size={12} className="text-green-400" />
                            Đã nộp
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(attempt.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
