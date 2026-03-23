import { useState } from 'react'
import { MessageSquare, ThumbsUp, Reply, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interactionsApi } from '@/api/interactionsApi'
import { useAuth } from '@/hooks'
import { Button } from './button'
import { useToast } from './Toast'

interface CommentSectionProps {
  lessonId: string
  isEnrolled: boolean
}

export function CommentSection({ lessonId, isEnrolled }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const { success, error: toastError } = useToast()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: async () => {
      const response = await interactionsApi.getLessonComments(lessonId)
      return response.data.data
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string | null }) =>
      interactionsApi.addComment(lessonId, text, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
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
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
    },
  })

  const handleSubmit = (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    const text = parentId ? replyText : commentText
    if (text.trim()) {
      addCommentMutation.mutate({ text, parentId })
    }
  }

  // Check if user already has a root comment on this lesson
  // Check if user already has a root comment on this lesson
  const hasCommented = user && comments.some(c => c.userId === user.id || c.userId === user.username)

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-bold flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span>Bình luận bài học ({comments.length})</span>
      </h3>

      {user && isEnrolled && !hasCommented ? (
        <form onSubmit={(e) => handleSubmit(e)} className="flex items-start space-x-4 mb-8">
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Bạn có câu hỏi hoặc ý kiến gì về bài học này?"
              className="w-full bg-surface border border-border rounded-lg p-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              rows={3}
              required
            />
            <div className="mt-2 flex flex-col items-end">
              <Button 
                type="submit" 
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </span>
                ) : 'Gửi bình luận'}
              </Button>
            </div>
          </div>
        </form>
      ) : user && isEnrolled && hasCommented ? (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-800 text-sm font-medium mb-8">
          Bạn đã bình luận bài học này. Bạn có thể tiếp tục trao đổi ở các bài học khác!
        </div>
      ) : user && !isEnrolled ? (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm font-medium mb-8">
          Bạn cần đăng ký khóa học để tham gia thảo luận.
        </div>
      ) : (
        <div className="bg-surface-2 p-4 rounded-lg text-center text-text-secondary border border-border mb-8">
          {!user ? "Vui lòng đăng nhập để tham gia thảo luận." : ""}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="rounded-full bg-surface-2 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surface-2 rounded w-1/4"></div>
                <div className="h-4 bg-surface-2 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <img
                src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userFullName || 'User')}&background=random`}
                alt={comment.userFullName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="bg-surface-2 rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{comment.userFullName || 'Người học'}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-text">{comment.content}</p>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 ml-2">
                  <button
                    onClick={() => toggleLikeMutation.mutate(comment.id)}
                    className={`flex items-center space-x-1 text-xs font-medium ${
                      user && comment.likes.includes(user.id) ? 'text-primary' : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes.length || 0} Thích</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-xs font-medium text-text-secondary hover:text-text"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Trả lời</span>
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && user && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Trả lời ${comment.userFullName || 'thành viên'}...`}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        autoFocus
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          Hủy
                        </Button>
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={!replyText.trim() || addCommentMutation.isPending}
                        >
                          Trả lời
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Replies Display */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 border-l-2 border-border pl-4 ml-2">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex space-x-3">
                        <img
                          src={reply.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userFullName || 'User')}&background=random`}
                          alt={reply.userFullName}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-surface border border-border rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{reply.userFullName || 'Người học'}</span>
                                <span className="text-xs text-text-secondary">
                                  {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed text-text">{reply.content}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1.5 ml-2">
                            <button
                              onClick={() => toggleLikeMutation.mutate(reply.id)}
                              className={`flex items-center space-x-1 text-xs font-medium ${
                                user && reply.likes.includes(user.id) ? 'text-primary' : 'text-text-secondary hover:text-text'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{reply.likes.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
