import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkEnrollment, enrollInCourse } from '@/api/enrollmentApi'
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

