import axiosClient from './axiosClient'
import type { FavoriteDTO, ReviewDTO, CommentDTO, ApiResponse, CourseDTO } from '@/types'

export const interactionsApi = {
  // Favorites
  toggleFavorite: (courseId: string) =>
    axiosClient.post<ApiResponse<FavoriteDTO | null>>(`/interactions/favorites/toggle`, { courseId }),
  checkFavorite: (courseId: string) =>
    axiosClient.get<ApiResponse<boolean>>(`/interactions/favorites/check/${courseId}`),
  getFavorites: () => axiosClient.get<ApiResponse<CourseDTO[]>>(`/interactions/favorites`),

  // Reviews
  getCourseReviews: (courseId: string) =>
    axiosClient.get<ApiResponse<ReviewDTO[]>>(`/interactions/reviews/course/${courseId}`),
  addReview: (courseId: string, rating: number, comment: string) =>
    axiosClient.post<ApiResponse<ReviewDTO>>(`/interactions/reviews`, { courseId, rating, comment }),

  // Comments
  getLessonComments: (lessonId: string) =>
    axiosClient.get<ApiResponse<CommentDTO[]>>(`/interactions/comments/lesson/${lessonId}`),
  addComment: (lessonId: string, content: string, parentId?: string | null) =>
    axiosClient.post<ApiResponse<CommentDTO>>(`/interactions/comments`, { lessonId, content, parentId }),
  toggleCommentLike: (commentId: string) =>
    axiosClient.post<ApiResponse<CommentDTO>>(`/interactions/comments/${commentId}/like`),
}
