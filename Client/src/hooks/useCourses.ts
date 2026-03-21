import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
  updateCourseStatus,
  generateInviteCode,
} from '@/api/coursesApi'
import type { CoursePayload, CourseStatus } from '@/types'

type UseCoursesOptions = {
  enabled?: boolean
}

export const COURSES_QUERY_KEY = ['admin-courses']

export const useCourses = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: getCourses,
    enabled: options.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCourse = (id: string, options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id),
    enabled: (options.enabled ?? true) && !!id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}


export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CoursePayload) => createCourse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CoursePayload }) =>
      updateCourse(courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })
}

export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: CourseStatus }) =>
      updateCourseStatus(courseId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })
}

export const useGenerateInviteCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => generateInviteCode(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY })
    },
  })
}
