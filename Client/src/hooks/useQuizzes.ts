import { useQuery } from '@tanstack/react-query'
import { getQuizzesByCourse, getMyAverageScore } from '@/api/quizApi'

export const QUIZZES_QUERY_KEY = 'quizzes'

export const useCourseQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: [QUIZZES_QUERY_KEY, courseId],
    queryFn: async () => {
      const response = await getQuizzesByCourse(courseId)
      return response.data || []
    },
    enabled: !!courseId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useMyAverageScore = () => {
  return useQuery({
    queryKey: ['myAverageScore'],
    queryFn: async () => {
      const response = await getMyAverageScore()
      return response.data || 0
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
