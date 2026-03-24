import { useState, type FormEvent } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, ArrowLeft, Save, Video, Image as ImageIcon, X } from "lucide-react"
import { useCreateLesson } from "@/hooks"
import { uploadImage, uploadVideo } from "@/api/uploadApi"
import type { LessonPayload } from "@/types"

export function InstructorCreateLessonPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const createLessonMutation = useCreateLesson()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [orderIndex, setOrderIndex] = useState("0")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp hình ảnh.")
      return
    }

    setIsUploadingImage(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      setImageUrl(url)
    } catch (err) {
      setError("Không thể tải ảnh lên. Vui lòng thử lại.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      setError("Vui lòng chọn tệp video.")
      return
    }

    setIsUploadingVideo(true)
    setError(null)
    try {
      const url = await uploadVideo(file)
      setVideoUrl(url)
    } catch (err) {
      setError("Không thể tải video lên. Vui lòng thử lại.")
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!courseId) return

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài học.")
      return
    }

    const payload: LessonPayload = {
      courseId,
      title: title.trim(),
      content: content.trim(),
      orderIndex: Number(orderIndex),
      imageUrl,
      videoUrl,
    }

    try {
      await createLessonMutation.mutateAsync(payload)
      alert("Tạo bài học thành công!")
      navigate("/instructor/courses")
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || "Không thể tạo bài học. Vui lòng thử lại.")
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 text-slate-500 transition-all font-medium"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo bài học mới</h1>
          <p className="text-slate-500 text-sm mt-1">Khóa học ID: <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{courseId}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm font-medium shadow-sm">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700">Tiêu đề bài học <span className="text-red-500">*</span></label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                placeholder="Ví dụ: Giới thiệu về React"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="orderIndex" className="text-sm font-semibold text-slate-700">Thứ tự bài học</label>
              <input
                id="orderIndex"
                type="number"
                min="0"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold text-slate-700">Nội dung bài học (Văn bản / Hướng dẫn chi tiết)</label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none text-slate-800 leading-relaxed"
              placeholder="Nhập nội dung bài giảng, cú pháp hỗ trợ Markdown..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                 Hình ảnh minh họa
              </label>
              <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Attachment" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                        title="Xóa ảnh"
                      >
                        <X size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors p-6 w-full h-full justify-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                      {isUploadingImage ? <Loader2 className="animate-spin text-indigo-500" /> : <ImageIcon size={24} />}
                    </div>
                    <p className="text-sm font-medium">Tải ảnh mô tả (Tùy chọn)</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                )}
                {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 text-indigo-600 font-semibold gap-2 shadow-inner">
                        <Loader2 className="animate-spin" size={20} />
                    </div>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                 Video khóa học
              </label>
              <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50">
                {videoUrl ? (
                  <>
                    <video src={videoUrl} controls className="w-full h-full object-cover bg-black" />
                    <button 
                      type="button" 
                      onClick={() => setVideoUrl("")}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md hover:scale-110"
                      title="Xóa video"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors p-6 w-full h-full justify-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                      {isUploadingVideo ? <Loader2 className="animate-spin text-indigo-500" /> : <Video size={24} />}
                    </div>
                    <p className="text-sm font-medium">Đăng tải Video (MP4)</p>
                    <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={isUploadingVideo} />
                  </label>
                )}
                {isUploadingVideo && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 text-indigo-600 font-semibold gap-2 shadow-inner">
                        <Loader2 className="animate-spin line-clamp-1" size={20} /> <span className="text-xs">Đang xử lý Video...</span>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:px-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-200/50 transition-colors focus:ring-2 focus:ring-slate-200"
            disabled={createLessonMutation.isPending}
          >
            Hủy lưu
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500/50"
            disabled={createLessonMutation.isPending || isUploadingImage || isUploadingVideo}
          >
            {createLessonMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Phát hành bài học</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
