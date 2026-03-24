import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, ArrowLeft, Save, Video, Image as ImageIcon, X } from "lucide-react";
import { useCreateLesson } from "@/hooks";
import { uploadImage, uploadVideo } from "@/api/uploadApi";
import type { LessonPayload } from "@/types";

export default function AdminCreateLessonPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const createLessonMutation = useCreateLesson();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp hình ảnh.");
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Vui lòng chọn tệp video.");
      return;
    }

    setIsUploadingVideo(true);
    setError(null);
    try {
      const url = await uploadVideo(file);
      setVideoUrl(url);
    } catch (err) {
      setError("Không thể tải video lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài học.");
      return;
    }

    const payload: LessonPayload = {
      courseId,
      title: title.trim(),
      content: content.trim(),
      orderIndex: Number(orderIndex),
      imageUrl,
      videoUrl,
    };

    try {
      await createLessonMutation.mutateAsync(payload);
      alert("Tạo bài học thành công!");
      navigate("/admin/courses");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Không thể tạo bài học. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tạo bài học mới</h1>
          <p className="text-slate-500 text-sm mt-1">Khóa học ID: <span className="font-mono text-blue-600">{courseId}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-700">Tiêu đề bài học</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ví dụ: Giới thiệu về React"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="orderIndex" className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
              <input
                id="orderIndex"
                type="number"
                min="0"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-slate-700">Nội dung bài học</label>
            <textarea
              id="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Nhập nội dung bài học bằng văn bản hoặc Markdown..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700 block">Hình ảnh đính kèm</label>
              <div className="relative group aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-blue-400">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Attachment" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors p-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      {isUploadingImage ? <Loader2 className="animate-spin text-blue-500" /> : <ImageIcon size={20} />}
                    </div>
                    <p className="text-xs font-medium">Tải ảnh lên</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700 block">Video bài học</label>
              <div className="relative group aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-blue-400">
                {videoUrl ? (
                  <>
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setVideoUrl("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors p-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      {isUploadingVideo ? <Loader2 className="animate-spin text-blue-500" /> : <Video size={20} />}
                    </div>
                    <p className="text-xs font-medium">Tải video lên</p>
                    <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={isUploadingVideo} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white transition-colors font-medium"
            disabled={createLessonMutation.isPending}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={createLessonMutation.isPending || isUploadingImage || isUploadingVideo}
          >
            {createLessonMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Lưu bài học</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
