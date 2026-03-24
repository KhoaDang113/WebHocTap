import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkEnrollment, enrollInCourse, getCourseProgress, completeLesson } from '@/api/enrollmentApi'
import { useAuth } from '@/hooks'

export const useEnrollmentStatus = (courseId?: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['enrollment', courseId, user?.username],
    queryFn: () => checkEnrollment(courseId as string),
    enabled: !!courseId && !!user,
    staleTime: 60 * 1000,
  })
}

export const useCourseProgress = (courseId?: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['progress', courseId, user?.username],
    queryFn: () => getCourseProgress(courseId as string),
    enabled: !!courseId && !!user,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useCompleteLesson = (courseId?: string) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (lessonId: string) => completeLesson(courseId as string, lessonId),
    onSuccess: () => {
      if (courseId && user) {
        queryClient.invalidateQueries({ queryKey: ['progress', courseId, user.username] })
        // Also invalidate my-courses to update profile percentage
        queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      }
    },
  })
}

export const useEnrollInCourse = (courseId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => enrollInCourse(courseId as string),
    onSuccess: () => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] })
      }
    },
  })
}

