import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Radio, X, ExternalLink } from "lucide-react";

export interface LiveToastData {
  sessionId: string;
  title: string;
  roomName?: string;
}

interface Props {
  data: LiveToastData | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 8000;

const LiveToast = ({ data, onDismiss }: Props) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!data) {
      setVisible(false);
      return;
    }

    // Animate in
    setVisible(true);
    setProgress(100);

    // Progress bar countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // chờ animation out
  };

  if (!data) return null;

  return createPortal(
    <div
      className={`fixed bottom-10 right-10 z-[9999] w-[340px] transition-all duration-300 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Thanh progress tự động mờ dần */}
        <div
          className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />

        {/* Nội dung */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon LIVE nhấp nháy */}
            <div className="flex-shrink-0 mt-0.5">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/15">
                <span className="absolute inline-flex h-full w-full rounded-xl bg-red-400 opacity-30 animate-ping" />
                <Radio
                  size={18}
                  className="text-red-600 dark:text-red-400 relative"
                />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
                  🔴 Livestream bắt đầu!
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug truncate">
                {data.title}
              </p>
              {data.roomName && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  Phòng: {data.roomName}
                </p>
              )}
            </div>

            {/* Nút đóng */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Nút hành động */}
          <div className="mt-3 flex gap-2">
            <Link
              to={`/live/${data.sessionId}`}
              onClick={handleDismiss}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-sm shadow-red-500/30 transition-all"
            >
              <ExternalLink size={12} />
              Tham gia ngay
            </Link>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LiveToast;
