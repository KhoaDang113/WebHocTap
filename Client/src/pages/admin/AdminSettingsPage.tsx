import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt</h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình và tùy chỉnh hệ thống</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Đang phát triển</h3>
        <p className="text-slate-500 text-sm">Chức năng Cài đặt đang được phát triển và sẽ sớm ra mắt.</p>
      </div>
    </div>
  );
}
