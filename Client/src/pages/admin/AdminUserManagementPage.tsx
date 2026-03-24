import { useState, useEffect } from "react";
import { useAuth, useUsers, useCreateUser, useUpdateUser, useDeleteUser, useLockUser, useUnlockUser } from "@/hooks";
import { Search, Filter, Edit, Lock, Unlock, Trash2, UserPlus, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Loader2, X } from "lucide-react";
import type { UserDTO, UserPayload } from "@/types";

const ITEMS_PER_PAGE = 10;

// ─── Avatar Component with initials fallback ─────────────────────────────
function UserAvatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover border border-slate-200"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${getColor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Modal Component ─────────────────────────────────────────────────────
function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserPayload) => void;
  initialData?: UserDTO | null;
  isLoading: boolean;
  title: string;
}) {
  const [form, setForm] = useState<UserPayload>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });

  const isEdit = !!initialData;

  // Sync form state khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setForm({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        fullName: initialData.fullName || "",
        role: (initialData.role === "ADMIN" ? "STUDENT" : initialData.role) || "STUDENT",
      });
    } else {
      setForm({
        username: "",
        email: "",
        password: "",
        fullName: "",
        role: "STUDENT",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tên đăng nhập */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={isEdit}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEdit ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập họ và tên"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập email"
            />
          </div>
          {/* Mật khẩu - chỉ bắt buộc khi tạo mới */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!isEdit}
                minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              />
            </div>
          )}
          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="STUDENT">Sinh viên</option>
              <option value="TEACHER">Giảng viên</option>
            </select>
          </div>
          {/* Thông tin thêm khi edit */}
          {isEdit && initialData && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Thông tin thêm</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className={`ml-2 font-medium ${initialData.isLocked ? "text-red-600" : "text-green-600"}`}>
                    {initialData.isLocked ? "Bị khóa" : "Hoạt động"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Ngày tạo:</span>
                  <span className="ml-2 text-slate-700">{initialData.createdAt ? new Date(initialData.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  variant = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading: boolean;
  variant?: "danger" | "warning";
}) {
  if (!isOpen) return null;
  const btnClass = variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === "danger" ? "bg-red-100" : "bg-orange-100"}`}>
            <AlertCircle className={variant === "danger" ? "text-red-600" : "text-orange-600"} size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex justify-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${btnClass}`}
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function AdminUserManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: users = [], isLoading, isError, error } = useUsers({ enabled: isAdmin });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [targetUser, setTargetUser] = useState<UserDTO | null>(null);

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();

  if (!isAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  // Map role to Vietnamese label
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      TEACHER: "Giảng viên",
      STUDENT: "Sinh viên",
    };
    return roleMap[role] || role;
  };

  // ─── Filter out ADMIN users ──────────────────────────
  const nonAdminUsers = (users as UserDTO[]).filter((u) => u.role !== "ADMIN");

  const transformedUsers = nonAdminUsers.map((u) => ({
    id: u.id,
    avatar: u.avatarUrl || "",
    name: u.fullName || u.username,
    email: u.email,
    role: getRoleLabel(u.role),
    rawRole: u.role,
    isLocked: u.isLocked,
    status: u.isLocked ? "Bị khóa" : "Hoạt động",
    originalUser: u,
  }));

  const filteredUsers = transformedUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Reset page when filters change
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
  const pagedUsers = filteredUsers.slice(startIdx, endIdx);

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleOpenEdit = (u: UserDTO) => {
    setEditingUser(u);
    setShowUserModal(true);
  };

  const handleSubmitUser = (data: UserPayload) => {
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, data },
        {
          onSuccess: () => {
            setShowUserModal(false);
            setEditingUser(null);
          },
        }
      );
    } else {
      createUser.mutate(data, {
        onSuccess: () => {
          setShowUserModal(false);
        },
      });
    }
  };

  const handleOpenDelete = (u: UserDTO) => {
    setTargetUser(u);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!targetUser) return;
    deleteUser.mutate(targetUser.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setTargetUser(null);
      },
    });
  };

  const handleOpenLockToggle = (u: UserDTO) => {
    setTargetUser(u);
    setShowLockConfirm(true);
  };

  const handleConfirmLockToggle = () => {
    if (!targetUser) return;
    const mutation = targetUser.isLocked ? unlockUser : lockUser;
    mutation.mutate(targetUser.id, {
      onSuccess: () => {
        setShowLockConfirm(false);
        setTargetUser(null);
      },
    });
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ─── Loading / Error states ────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const statusCode = (error as { response?: { status?: number } })?.response?.status;
    const errorMessage =
      statusCode === 403
        ? "Bạn không có quyền xem danh sách người dùng (403)."
        : (error?.message || "Không thể tải dữ liệu người dùng");

    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="text-red-600" size={32} />
          <p className="text-slate-600">Lỗi: {errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý User</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản, phân quyền và trạng thái người dùng nội bộ</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          <span>Thêm người dùng mới</span>
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <Filter size={16} /> Lọc:
            </div>

            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={roleFilter}
              onChange={handleFilterChange(setRoleFilter)}
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Sinh viên">Sinh viên</option>
            </select>

            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Bị khóa">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-4 px-6 font-semibold w-12">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-4 px-6 font-semibold">Người dùng</th>
                <th className="py-4 px-6 font-semibold">Vai trò</th>
                <th className="py-4 px-6 font-semibold">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedUsers.length > 0 ? (
                pagedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-6">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={u.avatar} name={u.name} size={40} />
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === "Giảng viên"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.status === "Hoạt động"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status === "Hoạt động" && <CheckCircle size={12} />}
                        {u.status === "Bị khóa" && <XCircle size={12} />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(u.originalUser)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenLockToggle(u.originalUser)}
                          className={`p-1.5 rounded ${
                            u.isLocked
                              ? "text-green-500 hover:text-green-700 hover:bg-green-50"
                              : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                          }`}
                          title={u.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {u.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button
                          onClick={() => handleOpenDelete(u.originalUser)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
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
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-800">{totalItems === 0 ? 0 : startIdx + 1}</span> đến{" "}
            <span className="font-medium text-slate-800">{endIdx}</span> trong số{" "}
            <span className="font-medium text-slate-800">{totalItems}</span> người dùng
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`dots-${i}`} className="text-slate-400 px-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-8 h-8 rounded font-medium text-sm flex items-center justify-center ${
                    safePage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="p-1.5 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        initialData={editingUser}
        isLoading={createUser.isPending || updateUser.isPending}
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTargetUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${targetUser?.fullName || targetUser?.username}"? Hành động này không thể hoàn tác.`}
        isLoading={deleteUser.isPending}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showLockConfirm}
        onClose={() => {
          setShowLockConfirm(false);
          setTargetUser(null);
        }}
        onConfirm={handleConfirmLockToggle}
        title={targetUser?.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
        message={
          targetUser?.isLocked
            ? `Bạn có muốn mở khóa tài khoản "${targetUser?.fullName || targetUser?.username}"?`
            : `Bạn có chắc chắn muốn khóa tài khoản "${targetUser?.fullName || targetUser?.username}"? Người dùng sẽ không thể đăng nhập.`
        }
        isLoading={lockUser.isPending || unlockUser.isPending}
        variant="warning"
      />
    </div>
  );
}
