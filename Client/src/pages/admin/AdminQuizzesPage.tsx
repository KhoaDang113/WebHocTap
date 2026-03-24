import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, HelpCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllQuizzes, deleteQuiz } from '@/api/quizApi'
import type { QuizDTO } from '@/types'

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchQuizzes = async () => {
    setIsLoading(true)
    try {
      const res = await getAllQuizzes()
      setQuizzes(res.data)
    } catch (error) {
      console.error('Lỗi tải danh sách quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá Quiz này? Tất cả câu hỏi và tuỳ chọn cũng sẽ bị xoá vĩnh viễn.')) {
      try {
        await deleteQuiz(id)
        fetchQuizzes()
      } catch (error) {
        alert('Lỗi khi xoá Quiz')
      }
    }
  }

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) || 
    q.courseId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="text-blue-600" />
            Quản lý Bài kiểm tra (Quiz)
          </h1>
          <p className="text-slate-500 mt-1">Quản lý danh sách các bài thi trắc nghiệm trong hệ thống.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tạo Quiz Mới
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm quiz..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Tiêu đề Quiz</th>
                <th className="px-6 py-4 font-medium">Course ID</th>
                <th className="px-6 py-4 font-medium">Thời gian thi</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy bài kiểm tra nào
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{quiz.courseId}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quiz.timeLimit} giây
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 border-slate-200">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(quiz.id)}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
