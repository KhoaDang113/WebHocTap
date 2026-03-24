import { useMemo, useState, type FormEvent, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, Pencil, Plus, Search, Trash2, Upload, Image as ImageIcon, FilePlus, RefreshCw, BookOpen } from "lucide-react"
import { uploadImage } from "@/api/uploadApi"
import { useAuth, useCategories, useCourses, useCreateCourse, useDeleteCourse, useUpdateCourse, useUpdateCourseStatus, useGenerateInviteCode } from "@/hooks"
import type { CategoryDTO, CourseDTO, CoursePayload, CourseStatus } from "@/types"

type CourseFormState = {
  title: string
  description: string
  thumbnailUrl: string
  price: string
  categoryId: string
  instructor: string
  status: CourseStatus
  isPrivate: boolean
}

const DEFAULT_FORM: CourseFormState = {
  title: "",
  description: "",
  thumbnailUrl: "",
  price: "0",
  categoryId: "",
  instructor: "",
  status: "DRAFT",
  isPrivate: false,
}

const STATUS_OPTIONS: Array<{ value: CourseStatus; label: string }> = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
]



const toFormState = (course: CourseDTO): CourseFormState => ({
  title: course.title,
  description: course.description ?? "",
  thumbnailUrl: course.thumbnailUrl ?? "",
  price: String(course.price ?? 0),
  categoryId: course.categoryId ?? "",
  instructor: course.instructor ?? "",
  status: course.status,
  isPrivate: course.isPrivate ?? false,
})

const toPayload = (form: CourseFormState): CoursePayload => ({
  title: form.title.trim(),
  description: form.description.trim(),
  thumbnailUrl: form.thumbnailUrl.trim(),
  price: Number(form.price),
  categoryId: form.categoryId,
  instructor: form.instructor.trim(),
  status: form.status,
  isPrivate: form.isPrivate,
})

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}

export function InstructorCoursesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isInstructor = user?.role === "TEACHER"

  const { data: allCourses = [], isLoading: isCoursesLoading, isError: isCoursesError, error: coursesError } = useCourses({
    enabled: isInstructor,
  })
  const { data: categories = [] } = useCategories({ enabled: isInstructor })

  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse()
  const updateStatusMutation = useUpdateCourseStatus()
  const deleteCourseMutation = useDeleteCourse()
  const generateInviteCodeMutation = useGenerateInviteCode()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | CourseStatus>("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null)
  const [formState, setFormState] = useState<CourseFormState>(DEFAULT_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)

  // Set instructor info automatically when form is open and inserting new
  useEffect(() => {
    if (isFormOpen && !editingCourse && user) {
      setFormState(prev => ({ ...prev, instructor: user.username }))
    }
  }, [isFormOpen, editingCourse, user])

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category: CategoryDTO) => [category.id, category.name])),
    [categories]
  )

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    // Only show courses that belong to the current instructor
    const instructorCourses = allCourses.filter(course =>
      course.instructor === user?.username
    )

    return instructorCourses.filter((course) => {
      const matchesKeyword =
        keyword.length === 0 ||
        course.title.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword)
      const matchesStatus = statusFilter === "ALL" || course.status === statusFilter
      const matchesCategory = categoryFilter === "ALL" || course.categoryId === categoryFilter

      return matchesKeyword && matchesStatus && matchesCategory
    })
  }, [allCourses, searchTerm, statusFilter, categoryFilter, user])

  const isSubmitting = createCourseMutation.isPending || updateCourseMutation.isPending
  const isBusy = isSubmitting || updateStatusMutation.isPending || deleteCourseMutation.isPending || generateInviteCodeMutation.isPending

  const openCreateForm = () => {
    setEditingCourse(null)
    setFormState({ ...DEFAULT_FORM, instructor: user?.username || "" })
    setFormError(null)
    setIsFormOpen(true)
  }

  const openEditForm = (course: CourseDTO) => {
    setEditingCourse(course)
    setFormState(toFormState(course))
    setFormError(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCourse(null)
    setFormState(DEFAULT_FORM)
    setFormError(null)
  }

  const validateForm = () => {
    if (!formState.title.trim()) {
      return "Vui lòng nhập tên khóa học."
    }

    if (!formState.categoryId) {
      return "Vui lòng chọn danh mục."
    }

    const priceValue = Number(formState.price)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      return "Giá khóa học phải là số không âm."
    }

    return null
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn tệp hình ảnh.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Kích thước ảnh không được vượt quá 5MB.")
      return
    }

    setIsUploadingThumbnail(true)
    setFormError(null)

    try {
      const imageUrl = await uploadImage(file)
      setFormState((prev: CourseFormState) => ({ ...prev, thumbnailUrl: imageUrl }))
    } catch (error) {
      setFormError(getErrorMessage(error, "Không thể tải ảnh lên."))
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = toPayload(formState)

    try {
      if (editingCourse) {
        await updateCourseMutation.mutateAsync({ courseId: editingCourse.id, payload })
      } else {
        await createCourseMutation.mutateAsync(payload)
      }
      closeForm()
    } catch (error) {
      setFormError(getErrorMessage(error, "Không thể lưu khóa học."))
    }
  }

  const handleDeleteCourse = async (course: CourseDTO) => {
    const shouldDelete = window.confirm(`Bạn có chắc muốn xóa khóa học "${course.title}" không?`)
    if (!shouldDelete) return

    try {
      await deleteCourseMutation.mutateAsync(course.id)
    } catch {
      setFormError("Không thể xóa khóa học. Vui lòng thử lại.")
    }
  }

  const handleChangeStatus = async (courseId: string, status: CourseStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ courseId, status })
    } catch {
      setFormError("Không thể cập nhật trạng thái khóa học.")
    }
  }

  const handleGenerateInviteCode = async (course: CourseDTO) => {
    try {
      if (course.inviteCode) {
        if (!window.confirm("Khóa học đã có mã. Bạn có chắc muốn tạo lại mã mới? Mã cũ sẽ mất hiệu lực.")) return
      }
      await generateInviteCodeMutation.mutateAsync(course.id)
    } catch {
      setFormError("Không thể tạo mã tham gia mới.")
    }
  }

  if (!isInstructor) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    )
  }

  if (isCoursesLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-slate-600 font-medium tracking-wide">Đang tải dữ liệu khóa học...</p>
        </div>
      </div>
    )
  }

  if (isCoursesError) {
    const message = getErrorMessage(coursesError, "Không thể tải dữ liệu khóa học.")

    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Lỗi: {message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Khóa học của tôi</h1>
          <p className="text-slate-500 text-sm mt-0.5" >Tạo mới, chỉnh sửa giáo trình và phát hành khóa học do bạn giảng dạy.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          onClick={openCreateForm}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tạo khóa học</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap w-full lg:w-auto items-center gap-3">
            <select
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white shadow-sm cursor-pointer"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | CourseStatus)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>

            <select
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white shadow-sm cursor-pointer"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((category: CategoryDTO) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 font-semibold w-2/5">Thông tin Khóa học</th>
                <th className="py-3 px-3 font-semibold">Danh mục</th>
                <th className="py-4 px-4 font-semibold">Giá</th>
                <th className="py-4 px-4 font-semibold text-center">Trạng thái & Mã LH</th>
                <th className="py-4 px-6 font-semibold text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 px-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                        <BookOpen size={28} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Chưa có khóa học nào</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm">Tạo khóa học mới để bắt đầu truyền đạt kiến thức và kết nối với học viên.</p>
                      <button
                        type="button"
                        className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
                        onClick={openCreateForm}
                      >
                        <Plus size={16} /> Tạo khóa học ngay
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        {course.isPrivate && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-[10px] bg-black/80 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">ẨN</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 pr-4 min-w-0">
                        <h4 className="font-semibold text-slate-900 line-clamp-1 leading-tight">{course.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{course.description || "Chưa có mô tả"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md whitespace-nowrap">
                      {categoryMap[course.categoryId] || "Chưa phân loại"}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {Number(course.price || 0) === 0 ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-sm font-bold">Miễn phí</span>
                    ) : (
                      <span>{Number(course.price).toLocaleString("vi-VN")} đ</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <select
                        className={`w-full text-center appearance-none border border-transparent hover:border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 bg-transparent ${course.status === 'PUBLISHED' ? 'text-emerald-600' : course.status === 'DRAFT' ? 'text-amber-600' : 'text-slate-600'}`}
                        value={course.status}
                        onChange={(event) => handleChangeStatus(course.id, event.target.value as CourseStatus)}
                        disabled={isBusy}
                      >
                        {STATUS_OPTIONS.map((statusOption) => (
                          <option key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </select>

                      {course.inviteCode ? (
                        <div className="flex items-center gap-1 group/code relative w-full px-2 justify-center">
                          <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100 select-all tracking-widest">
                            {course.inviteCode}
                          </span>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            onClick={() => handleGenerateInviteCode(course)}
                            disabled={isBusy}
                            title="Tạo lại mã"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateInviteCode(course)}
                          disabled={isBusy}
                          className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 px-3 py-1 rounded-md transition-all flex items-center justify-center gap-1 w-full"
                        >
                          Tạo mã lớp
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-100 transition-all font-medium flex items-center gap-2"
                        onClick={() => navigate(`/instructor/lessons?courseId=${course.id}`)}
                        disabled={isBusy}
                      >
                        <FilePlus size={16} /> <span className="text-xs hidden xl:inline-block">QL Bài học</span>
                      </button>
                      <button
                        type="button"
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-100 transition-all cursor-pointer"
                        onClick={() => openEditForm(course)}
                        disabled={isBusy}
                        title="Chỉnh sửa chung"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                        onClick={() => handleDeleteCourse(course)}
                        disabled={isBusy}
                        title="Xóa khóa học"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 my-auto transform transition-all">
            <div className="border-b border-slate-100 px-6 sm:px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</h2>
                <p className="text-sm text-slate-500 mt-1">{editingCourse ? "Cập nhật các thông tin của khóa học hiện tại." : "Điền thông tin cơ bản để bắt đầu xây dựng giáo trình."}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 sm:px-8 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Form Content layout modified for Instructor view focusing more on UX */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Tên khóa học <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 font-medium"
                    placeholder="Ví dụ: React Native thực chiến"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Giá khóa học (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formState.price}
                      onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-mono border-l pl-3 border-slate-200">đ</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Danh mục phân loại <span className="text-red-500">*</span></label>
                  <select
                    value={formState.categoryId}
                    onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white text-slate-700 cursor-pointer"
                    required
                  >
                    <option value="" disabled>Chọn danh mục môn học...</option>
                    {categories.map((category: CategoryDTO) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Tên Bút Danh / Người đứng lớp</label>
                  <input
                    type="text"
                    value={formState.instructor}
                    readOnly
                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400">Bạn là người duy nhất sở hữu khóa học này.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Trạng thái khóa học</label>
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as CourseStatus }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white text-slate-700 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-center pb-2 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer w-max select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formState.isPrivate}
                        onChange={(e) => setFormState((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Ẩn khóa học (Chỉ xem qua link/mã mời)</span>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Mô tả tổng quát</label>
                  <textarea
                    rows={4}
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 resize-none"
                    placeholder="Viết một đoạn ngắn tóm tắt nội dung chính để thu hút học viên..."
                  />
                </div>

                <div className="md:col-span-2 space-y-2 pt-2">
                  <label className="text-sm font-semibold text-slate-700">Ảnh bìa (Thumbnail)</label>
                  <div className="relative group w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50">
                    {formState.thumbnailUrl ? (
                      <>
                        <img src={formState.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <label className="cursor-pointer bg-white text-slate-900 px-5 py-2.5 rounded-xl border border-white/30 hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 font-medium shadow-xl">
                            <Upload size={18} /> Thay ảnh bìa khác
                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={isUploadingThumbnail} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors p-8 w-full h-full justify-center">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                          {isUploadingThumbnail ? <Loader2 className="animate-spin text-indigo-600" size={24} /> : <ImageIcon size={28} strokeWidth={1.5} />}
                        </div>
                        <div className="text-center mt-2">
                          <p className="font-semibold text-sm text-slate-700">Thêm ảnh bìa để khóa học sinh động hơn</p>
                          <p className="text-xs mt-1">Định dạng PNG, JPG (Tối đa 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={isUploadingThumbnail} />
                      </label>
                    )}

                    {isUploadingThumbnail && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                          <Loader2 className="animate-spin text-indigo-600" size={32} />
                          <span className="text-sm font-semibold text-slate-700">Đang xử lý tải lên...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-200"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 disabled:bg-slate-400 disabled:shadow-none transition-all focus:ring-2 focus:ring-indigo-500/50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> {editingCourse ? "Đang cập nhật..." : "Đang tạo..."}</span>
                  ) : (
                    editingCourse ? "Lưu thay đổi" : "Hoàn thành tạo mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
