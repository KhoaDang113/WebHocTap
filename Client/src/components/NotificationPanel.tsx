import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  BookOpen,
  ChevronRight,
  Loader2,
  BellOff,
  RefreshCw,
} from "lucide-react";
import { getLiveSessions } from "@/api/liveSessionApi";
import { getMyCourses } from "@/api/enrollmentApi";
import type { LiveSessionDTO, CourseDTO } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const NotificationPanel = ({ open, onClose, anchorRef }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<LiveSessionDTO[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allSessions, myCourses] = await Promise.all([
        getLiveSessions("ACTIVE"),
        getMyCourses(),
      ]);

      const enrolledCourseIds = new Set(myCourses.map((c) => c.id));
      const relevantSessions = allSessions.filter((s) =>
        enrolledCourseIds.has(s.courseId),
      );

      setSessions(relevantSessions);
      setCourses(myCourses);
      setLastFetched(new Date());
    } catch {
      // silently fail; user can retry
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const getCourseName = (courseId: string) =>
    courses.find((c) => c.id === courseId)?.title ?? "Không rõ khóa học";

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[500] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Livestream đang diễn ra
          </h3>
          {sessions.length > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              {sessions.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-1.5 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
          title="Làm mới"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin mb-3 text-indigo-400" />
            <p className="text-sm">Đang tải thông báo...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
            <BellOff size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Không có lớp đang livestream</p>
            <p className="text-xs mt-1 opacity-70">
              Chúng tôi sẽ thông báo khi có buổi học trực tiếp
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Live badge + course */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1 bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    <Radio size={9} />
                    LIVE
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <BookOpen size={11} />
                    <span className="truncate max-w-[200px]">
                      {getCourseName(s.courseId)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-1 leading-tight">
                  {s.title}
                </h4>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {s.description}
                  </p>
                )}

                {/* Action */}
                <Link
                  to={`/live/${s.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  Tham gia ngay
                  <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {lastFetched && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Cập nhật lúc{" "}
            {lastFetched.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
