import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, HelpCircle, Loader2, Sparkles, X, Wand2, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllQuizzes, deleteQuiz, createQuiz, getQuizById, updateQuiz } from '@/api/quizApi'
import { getCourses } from '@/api/coursesApi'
import { generateQuizQuestions } from '@/api/aiApi'
import type { QuizDTO, CourseDTO } from '@/types'

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLIC", label: "Công khai" },
  { value: "PRIVATE", label: "Riêng tư" },
]

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([])
  const [courses, setCourses] = useState<CourseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // View Modal state
  const [selectedViewQuiz, setSelectedViewQuiz] = useState<QuizDTO | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  
  // Edit Modal State
  const [editingQuiz, setEditingQuiz] = useState<QuizDTO | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // AI Modal States
  const [aiTopic, setAiTopic] = useState('')
  const [aiNumQuestions, setAiNumQuestions] = useState('5')
  const [aiCourseId, setAiCourseId] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false)
  const [aiTitle, setAiTitle] = useState('')
  const [aiTimeLimit, setAiTimeLimit] = useState('600')
  const [aiMaxAttempts, setAiMaxAttempts] = useState('1')
  const [isAutoCreateQuiz, setIsAutoCreateQuiz] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [quizzesRes, coursesRes] = await Promise.all([
        getAllQuizzes(),
        getCourses()
      ])
      setQuizzes(quizzesRes.data)
      setCourses(coursesRes)
      if (coursesRes.length > 0 && !aiCourseId) {
        setAiCourseId(coursesRes[0].id)
        setCourseSearch(coursesRes[0].title)
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleView = async (id: string) => {
    try {
      const res = await getQuizById(id)
      setSelectedViewQuiz(res.data)
      setIsViewModalOpen(true)
    } catch (e) {
      alert("Lỗi khi tải thông tin bài thi")
    }
  }

  const handleEditClick = async (id: string) => {
    try {
      const res = await getQuizById(id)
      setEditingQuiz(res.data)
      setIsEditModalOpen(true)
    } catch (e) {
      alert("Lỗi tải thông tin bài thi để sửa")
    }
  }

  const handleSaveEdit = async () => {
    if(!editingQuiz) return
    if (!editingQuiz.title.trim() || !editingQuiz.courseId) {
      alert("Thiếu tên bài thi hoặc khóa học"); return;
    }
    try {
      await updateQuiz(editingQuiz.id, {
         courseId: editingQuiz.courseId,
         title: editingQuiz.title,
         timeLimit: editingQuiz.timeLimit,
         maxAttempts: editingQuiz.maxAttempts,
         status: editingQuiz.status,
         questions: editingQuiz.questions?.map(q => ({
             content: q.content,
             answers: q.answers.map(a => ({
                 content: a.content,
                 isCorrect: !!a.isCorrect
             }))
         }))
      })
      alert("Cập nhật bài thi thành công")
      setIsEditModalOpen(false)
      fetchData()
    } catch (error) {
       alert("Có lỗi xảy ra khi cập nhật")
    }
  }

  const addQuestion = () => {
     if(!editingQuiz) return
     const newQuestions = [...(editingQuiz.questions || []), {id: `temp-${Date.now()}`, content: 'Câu hỏi mới', answers: [{id:`a1-${Date.now()}`, content:'Đáp án 1', isCorrect: true},{id:`a2-${Date.now()}`, content:'Đáp án 2', isCorrect: false},{id:`a3-${Date.now()}`, content:'Đáp án 3', isCorrect: false},{id:`a4-${Date.now()}`, content:'Đáp án 4', isCorrect: false}]}]
     setEditingQuiz({...editingQuiz, questions: newQuestions})
  }

  const removeQuestion = (idx: number) => {
     if(!editingQuiz) return
     const newQuestions = [...(editingQuiz.questions || [])]
     newQuestions.splice(idx, 1)
     setEditingQuiz({...editingQuiz, questions: newQuestions})
  }

  const updateQuestionContent = (idx: number, content: string) => {
     if(!editingQuiz) return;
     const newQuestions = [...(editingQuiz.questions || [])]
     newQuestions[idx].content = content
     setEditingQuiz({...editingQuiz, questions: newQuestions})
  }

  const updateAnswer = (qIdx: number, aIdx: number, field: 'content' | 'isCorrect', value: any) => {
     if(!editingQuiz) return;
     const newQuestions = [...(editingQuiz.questions || [])]
     if (field === 'isCorrect' && value === true) {
         // make others false
         newQuestions[qIdx].answers.forEach((a, i) => {
             a.isCorrect = (i === aIdx)
         })
     } else if (field === 'content') {
         newQuestions[qIdx].answers[aIdx].content = value
     }
     setEditingQuiz({...editingQuiz, questions: newQuestions})
  }

  const handleAiGenerate = async () => {
    if (!aiTopic.trim() || !aiCourseId || !aiTitle.trim()) {
      alert("Vui lòng điền đủ Chủ đề, Tên Quiz và chọn Khóa học.");
      return;
    }

    setIsGenerating(true)
    try {
      // 1. Generate questions via AI
      const questions = await generateQuizQuestions({
        topic: aiTopic,
        numQuestions: Number(aiNumQuestions)
      })

      if (isAutoCreateQuiz) {
        // 2. Create Quiz automatically
        await createQuiz({
          courseId: aiCourseId,
          title: aiTitle,
          timeLimit: Number(aiTimeLimit),
          maxAttempts: Number(aiMaxAttempts),
          status: 'DRAFT',
          questions: questions
        })
        alert('Tạo Quiz bằng AI thành công!')
        setIsAiModalOpen(false)
        fetchData()
      } else {
        alert('Đã tạo xong ' + questions.length + ' câu hỏi bằng AI thành công! (Xem console log để biết chi tiết do tính năng tạo bài thi tự động đang tắt)')
        console.log('AI Generated Questions:', questions)
      }
    } catch (error: any) {
      console.error("Lỗi AI:", error)
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo câu hỏi bằng AI!')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá Quiz này? Tất cả câu hỏi và tuỳ chọn cũng sẽ bị xoá vĩnh viễn.')) {
      try {
        await deleteQuiz(id)
        fetchData()
      } catch (error) {
        alert('Lỗi khi xoá Quiz')
      }
    }
  }

  const handleChangeStatus = async (quizId: string, status: string, quizData: QuizDTO) => {
    // 1. Optimistic update (thay đổi UI ngay tức thì không cần đợi)
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, status: status as "DRAFT" | "PUBLIC" | "PRIVATE" } : q))
    
    try {
      // 2. Gọi API ngầm
      await updateQuiz(quizId, {
        courseId: quizData.courseId,
        title: quizData.title,
        timeLimit: quizData.timeLimit,
        maxAttempts: quizData.maxAttempts,
        status: status,
        questions: quizData.questions?.map(q => ({
             content: q.content,
             answers: q.answers.map(a => ({
                 content: a.content,
                 isCorrect: !!a.isCorrect
             }))
         })) || []
      })
      // Tùy chọn: Sync ngầm (không set loading)
      const res = await getAllQuizzes()
      if (res.data) setQuizzes(res.data)
    } catch (error) {
      alert("Không thể cập nhật trạng thái bài thi.")
      fetchData() // revert lại nếu lỗi
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
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAiModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Tạo bằng AI
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
            <Plus className="mr-2 h-4 w-4" /> Tạo Quiz Mới
          </Button>
        </div>
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
                <th className="px-6 py-4 font-medium min-w-[200px]">Tiêu đề Quiz</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Course ID</th>
                <th className="px-6 py-4 font-medium">Thời gian thi</th>
                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy bài kiểm tra nào
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs hidden sm:table-cell">{quiz.courseId}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quiz.timeLimit} giây
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <select
                          className={`w-full text-center appearance-none border border-transparent hover:border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer focus:ring-2 focus:ring-purple-500 bg-transparent ${quiz.status === 'PUBLIC' ? 'text-emerald-600' : quiz.status === 'DRAFT' ? 'text-amber-600' : 'text-slate-600'}`}
                          value={quiz.status || 'DRAFT'}
                          onChange={(event) => handleChangeStatus(quiz.id, event.target.value, quiz)}
                        >
                          {STATUS_OPTIONS.map((statusOption) => (
                            <option key={statusOption.value} value={statusOption.value}>
                              {statusOption.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleView(quiz.id)}
                          className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 border-slate-200"
                          title="Xem câu hỏi"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditClick(quiz.id)}
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 border-slate-200"
                        >
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

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Wand2 className="text-purple-600 w-5 h-5" /> 
                Tạo Quiz bằng AI
              </h3>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-sm text-slate-500">
                Nhập chủ đề và các thông số, hệ thống sẽ tự động sinh câu hỏi trắc nghiệm bằng AI và lập tức tạo ra Quiz này.
              </p>

              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-slate-700">Thuộc khóa học</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={courseSearch}
                    placeholder="Nhập tên khóa học để tìm..."
                    onChange={(e) => {
                      setCourseSearch(e.target.value)
                      setIsCourseDropdownOpen(true)
                      if (!e.target.value) setAiCourseId('') // Reset if cleared
                    }}
                    onFocus={() => setIsCourseDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCourseDropdownOpen(false), 200)}
                    className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  
                  {isCourseDropdownOpen && (
                    <div className="absolute top-11 left-0 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                      {courses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase())).length > 0 ? (
                        courses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase())).map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setAiCourseId(c.id)
                              setCourseSearch(c.title)
                              setIsCourseDropdownOpen(false)
                            }}
                            className={`px-4 py-2 cursor-pointer transition-colors text-sm ${aiCourseId === c.id ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            <div className="truncate">{c.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-70">ID: {c.id}</div>
                          </div>
                        ))
                      ) : (
                         <div className="px-4 py-3 text-sm text-slate-500 text-center italic">Không tìm thấy khóa học</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tên Quiz</label>
                  <input 
                    type="text"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    placeholder="Ví dụ: Kiểm tra 15p"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thời gian (giây)</label>
                  <input 
                    type="number"
                    value={aiTimeLimit}
                    onChange={(e) => setAiTimeLimit(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Số lượt làm</label>
                  <input 
                    type="number"
                    min="1"
                    value={aiMaxAttempts}
                    onChange={(e) => setAiMaxAttempts(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Chủ đề gốc cho AI</label>
                <textarea 
                  rows={3}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: HTML Header và Footer cơ bản..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số lượng câu hỏi</label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  value={aiNumQuestions}
                  onChange={(e) => setAiNumQuestions(e.target.value)}
                  placeholder="Nhập số lượng (Ví dụ: 10)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="autoCreate" 
                  checked={isAutoCreateQuiz}
                  onChange={(e) => setIsAutoCreateQuiz(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="autoCreate" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Tự động lưu thành bài thi sau khi AI tạo xong
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsAiModalOpen(false)} disabled={isGenerating} className="border-slate-200 hover:bg-slate-50 text-slate-600">
                Hủy
              </Button>
              <Button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
              >
                {isGenerating ? (
                   <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Đang tạo...</>
                ) : (
                   <><Sparkles className="mr-2 w-4 h-4" /> Bắt đầu tạo</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Quiz Questions Modal */}
      {isViewModalOpen && selectedViewQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <Eye className="text-blue-600 w-5 h-5" /> 
                  Chi tiết Quiz: {selectedViewQuiz.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Đang hiển thị {selectedViewQuiz.questions?.length || 0} câu hỏi trắc nghiệm
                </p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
              {(!selectedViewQuiz.questions || selectedViewQuiz.questions.length === 0) ? (
                <div className="text-center py-10 text-slate-500">Chưa có câu hỏi nào trong bài thi này.</div>
              ) : (
                selectedViewQuiz.questions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                    <p className="font-medium text-slate-800 mb-4 leading-relaxed">
                      <span className="text-blue-600 font-bold mr-1">Câu {idx + 1}:</span> {q.content}
                    </p>
                    <div className="space-y-2 pl-2 md:pl-6">
                      {q.answers.map((ans, aIdx) => (
                         <div key={ans.id || aIdx} className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 transition-colors ${ans.isCorrect ? 'bg-green-50 border-green-200 text-green-800 shadow-sm' : 'bg-slate-50/50 border-slate-200 text-slate-600'}`}>
                           {ans.isCorrect ? (
                             <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                           ) : (
                             <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                           )}
                           <span className="leading-snug pt-0.5">{ans.content}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-white rounded-b-xl">
              <Button onClick={() => setIsViewModalOpen(false)} variant="outline" className="px-6">Đóng lại</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {isEditModalOpen && editingQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-2 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Edit2 className="text-blue-600 w-5 h-5" /> 
                Chỉnh sửa Bài thi
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
              {/* General Form Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Tên bài thi</label>
                  <input 
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Khóa học ID</label>
                  <select
                     value={editingQuiz.courseId}
                     onChange={(e) => setEditingQuiz({...editingQuiz, courseId: e.target.value})}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                     <option value="" disabled>-- Chọn khóa học --</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thời gian (giây)</label>
                  <input 
                    type="number"
                    value={editingQuiz.timeLimit}
                    onChange={(e) => setEditingQuiz({...editingQuiz, timeLimit: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2 text-slate-700">
                  <label className="text-sm font-medium">Số lượt làm bài tối đa</label>
                  <input 
                    type="number"
                    min="1"
                    value={editingQuiz.maxAttempts || 1}
                    onChange={(e) => setEditingQuiz({...editingQuiz, maxAttempts: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Questions Area */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-lg">Danh sách câu hỏi ({editingQuiz.questions?.length || 0})</h4>
                  <Button onClick={addQuestion} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-1" /> Thêm câu hỏi
                  </Button>
                </div>

                <div className="space-y-5">
                  {editingQuiz.questions?.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex items-start gap-3 justify-between">
                         <div className="flex-1 space-y-1">
                           <label className="text-sm font-bold text-blue-600 flex items-center justify-between">
                             <span>Câu hỏi {qIdx + 1}</span>
                           </label>
                           <textarea 
                             value={q.content}
                             onChange={(e) => updateQuestionContent(qIdx, e.target.value)}
                             rows={2}
                             className="w-full px-4 py-2 mt-1 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-800"
                           />
                         </div>
                         <button 
                           onClick={() => removeQuestion(qIdx)}
                           className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                           title="Xóa câu hỏi này"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>

                      <div className="grid gap-2 pl-2 md:pl-6">
                        {q.answers.map((ans, aIdx) => (
                          <div key={ans.id || aIdx} className="flex items-center gap-3">
                             <input 
                               type="radio" 
                               name={`correct-${qIdx}`}
                               checked={ans.isCorrect}
                               onChange={(e) => updateAnswer(qIdx, aIdx, 'isCorrect', e.target.checked)}
                               className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500 cursor-pointer"
                             />
                             <input
                               type="text"
                               value={ans.content}
                               onChange={(e) => updateAnswer(qIdx, aIdx, 'content', e.target.value)}
                               placeholder={`Đáp án ${aIdx + 1}`}
                               className={`flex-1 px-3 py-1.5 text-sm rounded border ${ans.isCorrect ? 'border-green-300 bg-green-50/50 text-green-800 font-medium' : 'border-slate-200 focus:border-blue-400 outline-none'}`}
                             />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(!editingQuiz.questions || editingQuiz.questions.length === 0) && (
                    <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 border-dashed rounded-xl">
                      Bấm "Thêm câu hỏi" để tạo câu trắc nghiệm mới.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white rounded-b-xl">
              <Button onClick={() => setIsEditModalOpen(false)} variant="outline">Hủy bỏ</Button>
              <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Lưu thay đổi</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
