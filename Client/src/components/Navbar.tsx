import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { useStompSubscription } from "@/hooks/useStompSubscription";
import { getMyCourses } from "@/api/enrollmentApi";
import {
  LogIn,
  UserPlus,
  LogOut,
  User,
  Key,
  ChevronDown,
  Menu,
  BookOpen,
  LayoutDashboard,
  Heart,
  ShieldCheck,
  Bell,
} from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";
import LiveToast, { type LiveToastData } from "@/components/LiveToast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasNewLive, setHasNewLive] = useState(false);
  const [liveToast, setLiveToast] = useState<LiveToastData | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Lấy danh sách course đã enroll khi user đăng nhập
  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) return;
    try {
      const courses = await getMyCourses();
      setEnrolledCourseIds(courses.map((c) => c.id));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Tạo topic key duy nhất từ danh sách courseIds để useStompSubscription theo dõi
  // Hook chỉ nhận 1 topic → dùng course đầu tiên; các course còn lại subscribe thủ công
  // bên dưới. Cách này giữ nguyên hook API mà không cần sửa hook.
  const primaryTopic = enrolledCourseIds[0]
    ? `/topic/course/${enrolledCourseIds[0]}/notification`
    : undefined;

  // WebSocket luôn active (Navbar luôn mount) → nhận tin khi giảng viên bắt livestream
  const stompRef = useStompSubscription({
    topic: primaryTopic,
    onMessage: (msg) => {
      try {
        const payload = JSON.parse(msg.body) as LiveToastData;
        setHasNewLive(true);
        setLiveToast(payload);
      } catch {
        setHasNewLive(true);
      }
    },
    enabled: enrolledCourseIds.length > 0,
  });

  // Subscribe thêm các course còn lại qua cùng 1 STOMP client
  useEffect(() => {
    if (enrolledCourseIds.length <= 1) return;
    const client = stompRef.current;
    if (!client?.connected) return;

    const subs = enrolledCourseIds.slice(1).map((id) =>
      client.subscribe(`/topic/course/${id}/notification`, (msg) => {
        try {
          const payload = JSON.parse(msg.body) as LiveToastData;
          setHasNewLive(true);
          setLiveToast(payload);
        } catch {
          setHasNewLive(true);
        }
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledCourseIds, stompRef.current?.connected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const getRoleBadge = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Admin",
      TEACHER: "Giảng viên",
      STUDENT: "Học viên",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      case "TEACHER":
        return "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "STUDENT":
        return "bg-green-100 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    }
  };

  const displayName = user?.username?.split("@")[0] || "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f0f19]/85 backdrop-blur-md border-b border-indigo-500/15 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-16">
        <Link
          to="/"
          className="flex items-center gap-2 no-underline text-slate-800 dark:text-white font-bold text-xl tracking-tight transition-opacity hover:opacity-85"
        >
          <span className="text-2xl flex items-center">📚</span>
          <span className="bg-gradient-to-br from-indigo-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            WebHocTap
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === "/"
                ? "text-purple-600 dark:text-purple-400 bg-slate-50 dark:bg-white/5"
                : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5"
            }`}
          >
            Trang chủ
            {location.pathname === "/" && (
              <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-sm" />
            )}
          </Link>
          <Link
            to="/courses"
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === "/courses"
                ? "text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-white/5"
                : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/5"
            }`}
          >
            Khóa học
            {location.pathname === "/courses" && (
              <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-sm" />
            )}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Bell / Notification */}
          {user && (
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => {
                  setIsNotifOpen((v) => !v);
                  setHasNewLive(false); // Xóa badge khi user mở panel
                }}
                className={`relative flex items-center justify-center w-9 h-9 border rounded-full transition-colors ${
                  isNotifOpen
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30"
                    : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
                title="Thông báo livestream"
              >
                <Bell size={16} className={isNotifOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-white/70"} />
                {/* Badge đỏ xuất hiện khi có livestream mới mà user chưa xem */}
                {hasNewLive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                )}
              </button>
              <NotificationPanel
                open={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                anchorRef={bellRef}
              />
            </div>
          )}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white/90 leading-tight">
                    {displayName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded-md uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}
                  >
                    {getRoleBadge(user.role)}
                  </span>
                </div>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.username}
                    </p>
                  </div>

                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      Quản lý hệ thống
                    </Link>
                  )}

                  {user.role === "TEACHER" && (
                    <a
                      href="/instructor/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Khu vực Giảng viên
                    </a>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </Link>

                  {user.role === "STUDENT" && (
                    <>
                      <Link
                        to="/profile#my-courses"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (location.pathname === "/profile") {
                            document
                              .getElementById("learning-overview")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        <BookOpen size={16} />
                        Khóa học của tôi
                      </Link>

                      <Link
                        to="/favorites"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Heart size={16} />
                        Khóa học yêu thích
                      </Link>
                    </>
                  )}

                  <Link
                    to="/change-password"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Key size={16} />
                    Đổi mật khẩu
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-white/85 border-2 border-slate-200 dark:border-indigo-500/40 rounded-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-white dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 transition-all"
              >
                <LogIn size={16} />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 shadow-[0_2px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.45)] transition-all -translate-y-px"
              >
                <UserPlus size={16} />
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 md:px-6 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f19]">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                location.pathname === "/"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/courses"
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                location.pathname === "/courses"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Khóa học
            </Link>

            {user ? (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                      {displayName}
                    </span>
                    <span
                      className={`text-[10px] w-fit font-bold px-2 py-0.5 mt-1 rounded-md uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleBadge(user.role)}
                    </span>
                  </div>
                </div>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShieldCheck size={16} />
                    Quản lý hệ thống
                  </Link>
                )}
                {user.role === "TEACHER" && (
                  <a
                    href="/instructor/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Khu vực Giảng viên
                  </a>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </Link>
                {user.role === "STUDENT" && (
                  <>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart size={16} />
                      Khóa học yêu thích
                    </Link>
                    <Link
                      to="/profile#my-courses"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (location.pathname === "/profile") {
                          document
                            .getElementById("learning-overview")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      <BookOpen size={16} />
                      Khóa học của tôi
                    </Link>
                  </>
                )}
                <Link
                  to="/change-password"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Key size={16} />
                  Đổi mật khẩu
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={16} />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus size={16} />
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast popup tự động khi có livestream mới */}
      <LiveToast
        data={liveToast}
        onDismiss={() => setLiveToast(null)}
      />
    </nav>
  );
};

export default Navbar;
