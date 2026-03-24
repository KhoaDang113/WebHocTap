import { useState, useMemo, type FormEvent } from "react";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Layers,
  X
} from "lucide-react";
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/hooks";
import type { CategoryDTO } from "@/types";
import type { CategoryPayload } from "@/api/categoriesApi";

const DEFAULT_FORM: CategoryPayload = {
  name: "",
  description: "",
};

export default function AdminCategoryPage() {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [formState, setFormState] = useState<CategoryPayload>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(keyword) ||
        cat.description?.toLowerCase().includes(keyword)
    );
  }, [categories, searchTerm]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormState(DEFAULT_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: CategoryDTO) => {
    setEditingCategory(category);
    setFormState({
      name: category.name,
      description: category.description || "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormState(DEFAULT_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.name.trim()) {
      setFormError("Tên danh mục không được để trống.");
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ 
          id: editingCategory.id, 
          payload: formState 
        });
      } else {
        await createMutation.mutateAsync(formState);
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (category: CategoryDTO) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(category.id);
      } catch (err: any) {
        alert(err.response?.data?.message || "Không thể xóa danh mục này.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-2 text-slate-500">Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Lỗi tải dữ liệu</h3>
        <p className="text-slate-500 max-w-md">
          {error instanceof Error ? error.message : "Không thể kết nối đến máy chủ."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Danh mục</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tổ chức các khóa học của bạn theo từng chủ đề.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Tổng cộng: <span className="text-slate-900">{categories.length}</span> danh mục
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">Tên danh mục</th>
                <th className="py-4 px-6 font-semibold">Mô tả</th>
                <th className="py-4 px-6 font-semibold">Ngày tạo</th>
                <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <Layers size={16} />
                        </div>
                        <span className="font-semibold text-slate-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate">
                      {category.description || "Chưa có mô tả"}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditForm(category)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    {searchTerm ? "Không tìm thấy danh mục nào." : "Chưa có danh mục nào được tạo."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tên danh mục</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Lập trình Web"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mô tả (tùy chọn)</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ngắn gọn về danh mục này..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                />
              </div>

              {formError && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Đang xử lý..." : editingCategory ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
