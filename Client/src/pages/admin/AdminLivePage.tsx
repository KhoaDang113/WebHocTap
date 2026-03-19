import { Video } from "lucide-react";

export default function AdminLivePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lớp học Live</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý và giám sát các buổi học trực tuyến</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Đang phát triển</h3>
        <p className="text-slate-500 text-sm">Chức năng Lớp học Live đang được phát triển và sẽ sớm ra mắt.</p>
      </div>
    </div>
  );
}
