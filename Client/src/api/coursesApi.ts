import axiosClient from '@/api/axiosClient'
import type {
  ApiResponse,
  CourseDTO,
  CoursePayload,
  CourseStatus,
} from '@/types'

const COURSE_API_PATH = '/courses'

export const getCourses = async (): Promise<CourseDTO[]> => {
  const response = await axiosClient.get<ApiResponse<CourseDTO[]>>(COURSE_API_PATH)
  return response.data.data
}

export const getCourseById = async (id: string): Promise<CourseDTO> => {
  const response = await axiosClient.get<ApiResponse<CourseDTO>>(`${COURSE_API_PATH}/${id}`)
  return response.data.data
}


export const createCourse = async (payload: CoursePayload): Promise<CourseDTO> => {
  const response = await axiosClient.post<ApiResponse<CourseDTO>>(COURSE_API_PATH, payload)
  return response.data.data
}

export const updateCourse = async (courseId: string, payload: CoursePayload): Promise<CourseDTO> => {
  const response = await axiosClient.put<ApiResponse<CourseDTO>>(`${COURSE_API_PATH}/${courseId}`, payload)
  return response.data.data
}

export const updateCourseStatus = async (courseId: string, status: CourseStatus): Promise<CourseDTO> => {
  const response = await axiosClient.patch<ApiResponse<CourseDTO>>(`${COURSE_API_PATH}/${courseId}/status`, { status })
  return response.data.data
}

export const deleteCourse = async (courseId: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`${COURSE_API_PATH}/${courseId}`)
}
