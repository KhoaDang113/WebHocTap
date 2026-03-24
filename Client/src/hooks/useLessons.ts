import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getLessons,
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/api/lessonsApi'
import type { LessonPayload } from '@/types'

export const LESSONS_QUERY_KEY = 'lessons'

export const useAllLessons = () => {
  return useQuery({
    queryKey: [LESSONS_QUERY_KEY],
    queryFn: getLessons,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useLessons = (courseId: string) => {
  return useQuery({
    queryKey: [LESSONS_QUERY_KEY, courseId],
    queryFn: () => getLessonsByCourse(courseId),
    enabled: !!courseId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LessonPayload) => createLesson(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.courseId] })
    },
  })
}

export const useUpdateLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LessonPayload }) =>
      updateLesson(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.payload.courseId] })
    },
  })
}

export const useDeleteLesson = (courseId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, courseId] })
    },
  })
}
