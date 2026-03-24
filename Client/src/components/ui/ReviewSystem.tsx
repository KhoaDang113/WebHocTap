import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interactionsApi } from '@/api/interactionsApi'
import { useAuth } from '@/hooks'
import { Button } from './button'
import { useToast } from './Toast'

interface ReviewSystemProps {
  courseId: string
  isEnrolled: boolean
}

export function ReviewSystem({ courseId, isEnrolled }: ReviewSystemProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const { success, error: toastError } = useToast()

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: async () => {
      const response = await interactionsApi.getCourseReviews(courseId)
      return response.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: () => interactionsApi.addReview(courseId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] })
      setRating(0)
      setComment('')
      success('Đã gửi đánh giá thành công!')
    },
    onError: (err: any) => {
      toastError(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0 && comment.trim()) {
      mutation.mutate()
    }
  }

  // Check if user already reviewed - use ID (new) or username (legacy) for compatibility
  const hasReviewed = reviews.some(r => r.userId === user?.id || r.userId === user?.username)

  const avgRating = reviews.length
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <h3 className="text-xl font-bold">Đánh giá khóa học</h3>
        {reviews.length > 0 && (
          <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">{avgRating}</span>
            <span className="text-sm text-slate-500">({reviews.length})</span>
          </div>
        )}
      </div>

      {user && user.role === 'STUDENT' && isEnrolled && !hasReviewed && (
        <form onSubmit={handleSubmit} className="bg-surface-2 p-6 rounded-xl border border-border">
          <h4 className="font-medium mb-4">Viết đánh giá của bạn</h4>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-300'
                  } transition-colors cursor-pointer`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
            className="w-full bg-surface border border-border rounded-lg p-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all mb-4"
            rows={4}
            required
          />
          <Button 
            type="submit" 
            disabled={rating === 0 || !comment.trim() || mutation.isPending}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </span>
            ) : 'Gửi đánh giá'}
          </Button>
        </form>
      )}

      {user && user.role === 'STUDENT' && isEnrolled && hasReviewed && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm font-medium">
          Bạn đã đánh giá khóa học này. Cảm ơn bạn đã phản hồi!
        </div>
      )}

      {user && user.role === 'STUDENT' && !isEnrolled && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm font-medium">
          Bạn cần đăng ký khóa học để có thể để lại đánh giá.
        </div>
      )}

      {user && user.role !== 'STUDENT' && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-500 text-sm font-medium text-center">
          Phần đánh giá chỉ dành riêng cho học viên.
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-surface-2 h-10 w-10"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-surface-2 rounded w-1/4"></div>
            <div className="h-2 bg-surface-2 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-text-secondary text-sm">Chưa có đánh giá nào cho khóa học này.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className={`p-4 rounded-xl border transition-all ${review.isHidden ? 'bg-red-50/50 border-red-100 opacity-80' : 'bg-surface-2 border-border'}`}>
                {review.isHidden && (
                  <div className="mb-3 px-4 py-2 bg-red-100/50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Đánh giá của bạn đã bị giảng viên ẩn (Chỉ bạn thấy thông báo này)
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userFullName || 'User')}&background=random`}
                      alt={review.userFullName}
                      className={`w-10 h-10 rounded-full ${review.isHidden ? 'grayscale' : ''}`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{review.userFullName || 'Người học'}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className={`max-w-none text-sm leading-relaxed mt-2 ${review.isHidden ? 'text-slate-400 italic' : 'text-text'}`}>
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
