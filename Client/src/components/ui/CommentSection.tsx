import { useState } from 'react'
import { 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  Loader2, 
  Pin, 
  PinOff,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Globe
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interactionsApi } from '@/api/interactionsApi'
import { useAuth } from '@/hooks'
import { Button } from './button'
import { useToast } from './Toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface CommentSectionProps {
  courseId: string
  lessonId?: string | null
  instructorUsername?: string
}

export function CommentSection({ courseId, lessonId, instructorUsername }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const { success, error: toastError } = useToast()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', lessonId || courseId],
    queryFn: async () => {
      const response = lessonId 
        ? await interactionsApi.getLessonComments(lessonId)
        : await interactionsApi.getCourseComments(courseId)
      return response.data.data
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string | null }) =>
      interactionsApi.addComment(courseId, text, lessonId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId || courseId] })
      setCommentText('')
      setReplyText('')
      setReplyingTo(null)
      success('Bình luận đã được gửi!')
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại sau.')
    }
  })

  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) => interactionsApi.toggleCommentLike(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId || courseId] })
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: (commentId: string) => interactionsApi.togglePinComment(commentId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId || courseId] })
      success(data.data.data.isPinned ? 'Đã ghim bình luận!' : 'Đã bỏ ghim bình luận!')
    },
  })

  const handleSubmit = (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    const text = parentId ? replyText : commentText
    if (text.trim()) {
      addCommentMutation.mutate({ text, parentId })
    }
  }

  const isModerator = user && (user.role === 'ADMIN' || user.username === instructorUsername);

  const renderBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-md uppercase tracking-tighter">
            <ShieldCheck size={10} /> Quản trị viên
          </span>
        );
      case 'INSTRUCTOR':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-md uppercase tracking-tighter shadow-sm border border-indigo-400/30">
            <GraduationCap size={10} /> Giảng viên
          </span>
        );
      case 'STUDENT':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-tighter border border-emerald-200">
            <UserCheck size={10} /> Học viên
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-tighter border border-slate-200">
            <Globe size={10} /> Thành viên
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 mt-12 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <span>{lessonId ? "Thảo luận bài học" : "Thảo luận chung"} <span className="text-slate-400 text-lg font-medium">({comments.length})</span></span>
        </h3>
      </div>

      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="relative group">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={lessonId ? "Bạn có thắc mắc gì về bài học này?..." : "Hỏi đội ngũ hoặc học viên khác về khóa học này nhé..."}
            className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-6 text-slate-700 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none shadow-inner min-h-[140px]"
            required
          />
          <div className="absolute right-4 bottom-4">
             <Button 
                type="submit" 
                size="lg"
                className="rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : 'Gửi bình luận'}
              </Button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50/80 border-2 border-dashed border-slate-200 p-8 rounded-[32px] text-center">
           <p className="font-bold text-slate-600">Đăng nhập để tham gia thảo luận cùng mọi người</p>
           <p className="text-slate-400 text-sm mt-1 mb-4 italic">Chúng tôi khuyến khích các câu hỏi xây dựng và chia sẻ kinh nghiệm</p>
           <Button variant="outline" className="rounded-xl border-slate-300">Đăng nhập ngay</Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="rounded-2xl bg-slate-100 h-14 w-14"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-20 bg-slate-50 rounded-[24px]"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 mt-10">
          {comments.length === 0 ? (
            <div className="py-20 flex flex-col items-center opacity-40">
               <Globe size={64} className="text-slate-300" />
               <p className="mt-4 font-bold text-slate-400">Hãy là người đầu tiên khơi mào cuộc thảo luận!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="group/comment relative">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <img
                      src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userFullName || 'U')}&background=random`}
                      alt=""
                      className={`w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm transition-transform group-hover/comment:scale-105 ${comment.userRole === 'INSTRUCTOR' ? 'ring-4 ring-indigo-50 border-2 border-indigo-400' : ''}`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className={`relative rounded-[32px] p-6 border transition-all ${comment.isPinned ? 'bg-indigo-50/40 border-indigo-100 ring-2 ring-indigo-50 shadow-md' : 'bg-slate-50/50 border-slate-100 group-hover/comment:bg-white group-hover/comment:border-indigo-50 group-hover/comment:shadow-lg'}`}>
                      {comment.isPinned && (
                        <div className="absolute -top-3 left-6 flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                           <Pin size={10} className="fill-current" /> Đã ghim
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 group-hover/comment:text-indigo-600 transition-colors uppercase tracking-tight text-sm">
                            {comment.userFullName || 'Người học'}
                          </span>
                          {renderBadge(comment.userRole)}
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm', { locale: vi })}
                          </span>
                          {isModerator && (
                             <button 
                               onClick={() => togglePinMutation.mutate(comment.id)}
                               className={`p-1.5 rounded-lg transition-all ${comment.isPinned ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
                             >
                               {comment.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                             </button>
                          )}
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed ${comment.isPinned ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                        {comment.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-3 ml-4">
                      <button
                        onClick={() => toggleLikeMutation.mutate(comment.id)}
                        className={`group/btn flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          user && comment.likes.includes(user.id) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg transition-all ${user && comment.likes.includes(user.id) ? 'bg-indigo-50 shadow-inner' : 'bg-transparent group-hover/btn:bg-slate-100'}`}>
                          <ThumbsUp className={`w-3.5 h-3.5 ${user && comment.likes.includes(user.id) ? 'fill-current' : ''}`} />
                        </div>
                        <span>{comment.likes.length || 0}</span>
                      </button>

                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className={`group/btn flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${replyingTo === comment.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <div className="p-1.5 rounded-lg bg-transparent group-hover/btn:bg-slate-100">
                          <Reply className="w-3.5 h-3.5" />
                        </div>
                        <span>Phản hồi</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    <AnimatePresence>
                      {replyingTo === comment.id && user && (
                        <motion.form 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          onSubmit={(e: React.FormEvent) => handleSubmit(e, comment.id)} 
                          className="mt-4 flex gap-3 overflow-hidden"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Hướng tới ${comment.userFullName || 'thành viên'}...`}
                              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-700 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-sm"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                                className="rounded-xl text-slate-400"
                              >
                                Hủy
                              </Button>
                              <Button 
                                type="submit" 
                                size="sm"
                                className="rounded-xl"
                                disabled={!replyText.trim() || addCommentMutation.isPending}
                              >
                                Gửi phản hồi
                              </Button>
                            </div>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Replies Display */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-6 space-y-6 border-l-[3px] border-slate-100 pl-6 ml-4">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex gap-4">
                            <img
                              src={reply.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userFullName || 'U')}&background=random`}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shadow-sm"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">{reply.userFullName || 'Người học'}</span>
                                      {renderBadge(reply.userRole)}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">
                                      {format(new Date(reply.createdAt), 'dd.MM.yyyy HH:mm', { locale: vi })}
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-600">{reply.content}</p>
                              </div>
                              <button
                                onClick={() => toggleLikeMutation.mutate(reply.id)}
                                className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest pl-2 ${
                                  user && reply.likes.includes(user.id) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes.length || 0} Hữu ích</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
