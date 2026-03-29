import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  XCircle,
} from "lucide-react";
import type { LiveScheduleDTO } from "@/types";

interface LiveTimetableProps {
  schedules: LiveScheduleDTO[];
  getCourseName: (courseId: string) => string;
  onCancel: (id: string, title: string) => void;
  onOpenCreate: (date?: Date, slot?: number) => void;
}

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const PERIODS = Array.from({ length: 15 }, (_, i) => `Tiết ${i + 1}`);

// Mapping period to approximate start hour
const periodToHour = (p: number) => p + 6; // Tiết 1 -> 7h

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateStr;
  }
};

export default function LiveTimetable({
  schedules,
  getCourseName,
  onCancel,
  onOpenCreate,
}: LiveTimetableProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => {
    const today = new Date();
    // Find Monday of current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
  }, [weekDates]);

  // Group schedules by day and period
  const gridData = useMemo(() => {
    const grid: Record<string, LiveScheduleDTO[]> = {};

    schedules.forEach((schedule) => {
      if (schedule.status !== "SCHEDULED") return;

      const date = new Date(schedule.startTime);
      const hour = date.getHours();
      const period = hour - 6; // 7h -> Tiết 1 (index 0)

      if (period < 0 || period >= 15) return;

      // Check if it's in the current week view
      const dayIndex = weekDates.findIndex(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear(),
      );

      if (dayIndex !== -1) {
        const key = `${dayIndex}-${period}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(schedule);
      }
    });

    return grid;
  }, [schedules, weekDates]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800">
            Thời Khóa Biểu Livestream
          </h2>
          <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {weekRangeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((v) => v - 1)}
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all"
          >
            Tuần này
          </button>
          <button
            onClick={() => setWeekOffset((v) => v + 1)}
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[1000px]">
          <thead>
            <tr>
              <th className="w-20 p-3 border-b border-r border-slate-200 bg-slate-50"></th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  className="p-3 border-b border-r border-slate-200 bg-slate-50 text-center"
                >
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    {day}
                  </div>
                  <div
                    className={`text-sm mt-1 ${weekDates[i].toDateString() === new Date().toDateString() ? "text-indigo-600 font-bold underline decoration-2 underline-offset-4" : "text-slate-700"}`}
                  >
                    {weekDates[i].getDate()}/{weekDates[i].getMonth() + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((periodName, pIndex) => (
              <tr key={periodName} className="group transition-colors">
                <td className="p-2 border-b border-r border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-400">
                  {periodName}
                  <div className="font-normal mt-0.5">
                    {periodToHour(pIndex)}:00
                  </div>
                </td>
                {DAYS.map((_, dIndex) => {
                  const items = gridData[`${dIndex}-${pIndex}`] || [];
                  return (
                    <td
                      key={dIndex}
                      className="p-1 border-b border-r border-slate-100 relative min-h-20 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      onClick={() =>
                        onOpenCreate(weekDates[dIndex], pIndex + 7)
                      }
                    >
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="mb-1 p-2 bg-indigo-600 text-white rounded shadow-sm relative overflow-visible group/item"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-[10px] font-bold opacity-80 uppercase leading-none mb-1">
                            {getCourseName(item.courseId).substring(0, 15)}...
                          </div>
                          <div className="text-xs font-bold leading-tight line-clamp-2">
                            {item.title}
                          </div>

                          {/* Hover Detail Card */}
                          <div className="absolute left-full top-0 ml-4 w-72 p-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-[100] invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover/item:scale-100 origin-left">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                                <h3 className="font-bold text-slate-900 leading-tight">
                                  {item.title}
                                </h3>
                              </div>
                              <div className="grid grid-cols-1 gap-2 text-xs text-left">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                  <p className="text-slate-400 font-medium mb-1 uppercase tracking-tight text-[9px]">
                                    Khóa học
                                  </p>
                                  <p className="text-slate-700 font-semibold truncate whitespace-normal">
                                    {getCourseName(item.courseId)}
                                  </p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                  <p className="text-slate-400 font-medium mb-1 uppercase tracking-tight text-[9px]">
                                    Thời gian dạy
                                  </p>
                                  <p className="text-slate-700 font-semibold">
                                    {formatDate(item.startTime)}
                                  </p>
                                </div>
                                {item.description && (
                                  <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className="text-slate-400 font-medium mb-1 uppercase tracking-tight text-[9px]">
                                      Mô tả chi tiết
                                    </p>
                                    <p className="text-slate-600 italic leading-relaxed whitespace-normal">
                                      {item.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white rotate-45 border-l border-b border-slate-200"></div>
                          </div>

                          <button
                            onClick={() => onCancel(item.id, item.title)}
                            className="absolute top-1 right-1 p-0.5 bg-black/20 hover:bg-black/40 rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <XCircle size={10} />
                          </button>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Clock size={12} />
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
