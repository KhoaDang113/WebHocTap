import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Pencil, Plus, Search, Trash2, Upload, Image as ImageIcon, FilePlus } from "lucide-react";
import { uploadImage } from "@/api/uploadApi";
import {
  useAuth,
  useCategories,
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse,
  useUpdateCourseStatus,
} from "@/hooks";
import type { CategoryDTO, CourseDTO, CoursePayload, CourseStatus } from "@/types";

type CourseFormState = {
  title: string;
  description: string;
  thumbnailUrl: string;
  price: string;
  categoryId: string;
  instructor: string;
  status: CourseStatus;
};

const DEFAULT_FORM: CourseFormState = {
  title: "",
  description: "",
  thumbnailUrl: "",
  price: "0",
  categoryId: "",
  instructor: "",
  status: "DRAFT",
};

const STATUS_OPTIONS: Array<{ value: CourseStatus; label: string }> = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

const STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

const STATUS_STYLE: Record<CourseStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-slate-200 text-slate-700",
};

const toFormState = (course: CourseDTO): CourseFormState => ({
  title: course.title,
  description: course.description ?? "",
  thumbnailUrl: course.thumbnailUrl ?? "",
  price: String(course.price ?? 0),
  categoryId: course.categoryId ?? "",
  instructor: course.instructor ?? "",
  status: course.status,
});

const toPayload = (form: CourseFormState): CoursePayload => ({
  title: form.title.trim(),
  description: form.description.trim(),
  thumbnailUrl: form.thumbnailUrl.trim(),
  price: Number(form.price),
  categoryId: form.categoryId,
  instructor: form.instructor.trim(),
  status: form.status,
});

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
};

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageCourse = user?.role === "ADMIN" || user?.role === "TEACHER";

  const { data: courses = [], isLoading: isCoursesLoading, isError: isCoursesError, error: coursesError } = useCourses({
    enabled: canManageCourse,
  });
  const { data: categories = [] } = useCategories({ enabled: canManageCourse });

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const updateStatusMutation = useUpdateCourseStatus();
  const deleteCourseMutation = useDeleteCourse();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CourseStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);
  const [formState, setFormState] = useState<CourseFormState>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category: CategoryDTO) => [category.id, category.name])),
    [categories]
  );

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesKeyword =
        keyword.length === 0 ||
        course.title.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "ALL" || course.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || course.categoryId === categoryFilter;

      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const isSubmitting = createCourseMutation.isPending || updateCourseMutation.isPending;
  const isBusy = isSubmitting || updateStatusMutation.isPending || deleteCourseMutation.isPending;

  const openCreateForm = () => {
    setEditingCourse(null);
    setFormState(DEFAULT_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (course: CourseDTO) => {
    setEditingCourse(course);
    setFormState(toFormState(course));
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
    setFormState(DEFAULT_FORM);
    setFormError(null);
  };

  const validateForm = () => {
    if (!formState.title.trim()) {
      return "Vui lòng nhập tên khóa học.";
    }

    if (!formState.categoryId) {
      return "Vui lòng chọn danh mục.";
    }

    const priceValue = Number(formState.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      return "Giá khóa học phải là số không âm.";
    }

    return null;
  };
  
  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn tệp hình ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    setIsUploadingThumbnail(true);
    setFormError(null);

    try {
      const imageUrl = await uploadImage(file);
      setFormState((prev: CourseFormState) => ({ ...prev, thumbnailUrl: imageUrl }));
    } catch (error) {
      setFormError(getErrorMessage(error, "Không thể tải ảnh lên."));
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = toPayload(formState);

    try {
      if (editingCourse) {
        await updateCourseMutation.mutateAsync({ courseId: editingCourse.id, payload });
      } else {
        await createCourseMutation.mutateAsync(payload);
      }

      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, "Không thể lưu khóa học."));
    }
  };

  const handleDeleteCourse = async (course: CourseDTO) => {
    const shouldDelete = window.confirm(`Bạn có chắc muốn xóa khóa học \"${course.title}\" không?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteCourseMutation.mutateAsync(course.id);
    } catch {
      setFormError("Không thể xóa khóa học. Vui lòng thử lại.");
    }
  };

  const handleChangeStatus = async (courseId: string, status: CourseStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ courseId, status });
    } catch {
      setFormError("Không thể cập nhật trạng thái khóa học.");
    }
  };

  if (!canManageCourse) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Bạn không có quyền truy cập trang quản lý khóa học.</p>
        </div>
      </div>
    );
  }

  if (isCoursesLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-600">Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  if (isCoursesError) {
    const message = getErrorMessage(coursesError, "Không thể tải dữ liệu khóa học.");

    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Lỗi: {message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khóa học</h1>
          <p className="text-slate-500 text-sm mt-1">Thêm, chỉnh sửa, cập nhật trạng thái và xóa khóa học.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          <span>Thêm khóa học</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap w-full lg:w-auto items-center gap-3">
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <table className="w-full text-left border-collapse min-w-230">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">Khóa học</th>
                <th className="py-4 px-6 font-semibold">Danh mục</th>
                <th className="py-4 px-6 font-semibold">Giá</th>
                <th className="py-4 px-6 font-semibold">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                    Chưa có khóa học phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}

              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="max-w-95">
                      <p className="font-semibold text-slate-800 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description || "Không có mô tả"}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{categoryMap[course.categoryId] || "Chưa phân loại"}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{Number(course.price || 0).toLocaleString("vi-VN")} đ</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[course.status]}`}>
                        {STATUS_LABEL[course.status]}
                      </span>
                      <select
                        className="border border-slate-300 rounded-md px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="p-2 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        onClick={() => navigate(`/admin/courses/${course.id}/lessons/create`)}
                        disabled={isBusy}
                        title="Tạo bài học"
                      >
                        <FilePlus size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => openEditForm(course)}
                        disabled={isBusy}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteCourse(course)}
                        disabled={isBusy}
                        title="Xóa"
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200">
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</h2>
                <p className="text-sm text-slate-500 mt-1">Nhập thông tin khóa học và lưu để cập nhật hệ thống.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Tên khóa học
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, title: event.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: React từ cơ bản đến nâng cao"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Danh mục
                  <select
                    value={formState.categoryId}
                    onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, categoryId: event.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category: CategoryDTO) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Giá khóa học (đ)
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formState.price}
                    onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, price: event.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Trạng thái
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, status: event.target.value as CourseStatus }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Giảng viên
                  <input
                    type="text"
                    value={formState.instructor}
                    onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, instructor: event.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên giảng viên"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Mô tả
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(event) => setFormState((prev: CourseFormState) => ({ ...prev, description: event.target.value }))}
                  className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn về khóa học"
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Ảnh đại diện</span>
                <div className="flex flex-col gap-4">
                  {/* Preview Area */}
                  <div className="relative group w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-blue-400">
                    {formState.thumbnailUrl ? (
                      <>
                        <img
                          src={formState.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2">
                            <Upload size={18} />
                            <span>Thay đổi ảnh</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleThumbnailUpload}
                              disabled={isUploadingThumbnail}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors p-8 w-full h-full justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50">
                          {isUploadingThumbnail ? (
                            <Loader2 className="animate-spin text-blue-500" size={24} />
                          ) : (
                            <ImageIcon size={24} />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">Nhấn để tải ảnh lên</p>
                          <p className="text-xs mt-1">PNG, JPG, JPEG (Tối đa 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          disabled={isUploadingThumbnail}
                        />
                      </label>
                    )}

                    {isUploadingThumbnail && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-blue-600" size={32} />
                          <span className="text-sm font-medium text-slate-600">Đang tải lên...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : editingCourse ? "Cập nhật" : "Tạo khóa học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
