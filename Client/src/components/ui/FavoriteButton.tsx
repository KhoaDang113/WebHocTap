import { Heart } from 'lucide-react'
import { interactionsApi } from '@/api/interactionsApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface FavoriteButtonProps {
  courseId: string
  className?: string
}

export function FavoriteButton({ courseId, className = '' }: FavoriteButtonProps) {
  const queryClient = useQueryClient()

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
        isFavorite ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
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
