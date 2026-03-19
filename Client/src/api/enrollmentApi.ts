import axiosClient from '@/api/axiosClient'
import type { ApiResponse } from '@/types'

const ENROLLMENT_API_PATH = '/enrollments'

export const enrollInCourse = async (courseId: string) => {
  const response = await axiosClient.post<ApiResponse<unknown>>(
    `${ENROLLMENT_API_PATH}/courses/${courseId}`,
  )
  return response.data
}

export const checkEnrollment = async (
  courseId: string,
): Promise<{ isEnrolled: boolean }> => {
  const response = await axiosClient.get<
    ApiResponse<{
      isEnrolled: boolean
    }>
  >(`${ENROLLMENT_API_PATH}/courses/${courseId}/check`)

  return response.data.data
}

