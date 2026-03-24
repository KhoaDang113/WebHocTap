import { Heart } from 'lucide-react'
import { interactionsApi } from '@/api/interactionsApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks'

interface FavoriteButtonProps {
  courseId: string
  className?: string
}

export function FavoriteButton({ courseId, className = '' }: FavoriteButtonProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Ẩn nút nếu không phải là học viên (STUDENT)
  if (!user || user.role !== 'STUDENT') {
    return null
  }

  const { data, isLoading } = useQuery({
    queryKey: ['favorite', courseId],
    queryFn: async () => {
      const response = await interactionsApi.checkFavorite(courseId)
      return response.data.data
    },
  })

  const isFavorite = data || false

  const mutation = useMutation({
    mutationFn: () => interactionsApi.toggleFavorite(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', courseId] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  if (isLoading) return null

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        mutation.mutate()
      }}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isFavorite ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-sm border border-red-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
      } ${className}`}
      disabled={mutation.isPending}
      title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
      />
    </button>
  )
}
