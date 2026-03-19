import axiosClient from '@/api/axiosClient'
import type {
  ApiResponse,
  LessonDTO,
  LessonPayload,
} from '@/types'

const LESSON_API_PATH = '/lessons'

export const getLessons = async (): Promise<LessonDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LessonDTO[]>>(LESSON_API_PATH)
  return response.data.data
}

export const getLessonById = async (id: string): Promise<LessonDTO> => {
  const response = await axiosClient.get<ApiResponse<LessonDTO>>(`${LESSON_API_PATH}/${id}`)
  return response.data.data
}

export const getLessonsByCourse = async (courseId: string): Promise<LessonDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LessonDTO[]>>(`${LESSON_API_PATH}/course/${courseId}`)
  return response.data.data
}

export const createLesson = async (payload: LessonPayload): Promise<LessonDTO> => {
  const response = await axiosClient.post<ApiResponse<LessonDTO>>(LESSON_API_PATH, payload)
  return response.data.data
}

export const updateLesson = async (id: string, payload: LessonPayload): Promise<LessonDTO> => {
  const response = await axiosClient.put<ApiResponse<LessonDTO>>(`${LESSON_API_PATH}/${id}`, payload)
  return response.data.data
}

export const deleteLesson = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`${LESSON_API_PATH}/${id}`)
}
