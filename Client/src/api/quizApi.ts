import axiosClient from './axiosClient'
import type { ApiResponse, QuizDTO, QuizAttemptDTO, SubmitQuizResponse, QuizAttemptHistoryResponse } from '@/types'

const API_PREFIX = '/quizzes'

export const getQuizById = async (quizId: string): Promise<ApiResponse<QuizDTO>> => {
  const response = await axiosClient.get(`${API_PREFIX}/${quizId}`)
  return response.data
}

export const getQuizzesByCourse = async (courseId: string): Promise<ApiResponse<QuizDTO[]>> => {
  const response = await axiosClient.get(`${API_PREFIX}/course/${courseId}`)
  return response.data
}

export const startQuiz = async (quizId: string): Promise<ApiResponse<QuizAttemptDTO>> => {
  const response = await axiosClient.post(`${API_PREFIX}/${quizId}/start`)
  return response.data
}

export const getQuizAttempt = async (quizId: string): Promise<ApiResponse<QuizAttemptDTO>> => {
  const response = await axiosClient.get(`${API_PREFIX}/${quizId}/attempt`)
  return response.data
}

export const submitQuiz = async (
  quizId: string,
  payload: { answers: Record<string, string> }
): Promise<ApiResponse<SubmitQuizResponse>> => {
  const response = await axiosClient.post(`${API_PREFIX}/${quizId}/submit`, payload)
  return response.data
}

export const getMyAverageScore = async (): Promise<ApiResponse<number>> => {
  const response = await axiosClient.get(`${API_PREFIX}/my-average-score`)
  return response.data
}

// Admin APIs
export const getAllQuizzes = async (): Promise<ApiResponse<QuizDTO[]>> => {
  const response = await axiosClient.get(API_PREFIX)
  return response.data
}

export const createQuiz = async (payload: any): Promise<ApiResponse<QuizDTO>> => {
  const response = await axiosClient.post(API_PREFIX, payload)
  return response.data
}

export const updateQuiz = async (id: string, payload: any): Promise<ApiResponse<QuizDTO>> => {
  const response = await axiosClient.put(`${API_PREFIX}/${id}`, payload)
  return response.data
}

export const deleteQuiz = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axiosClient.delete(`${API_PREFIX}/${id}`)
  return response.data
}

export const getAllAttempts = async (): Promise<ApiResponse<QuizAttemptHistoryResponse[]>> => {
  const response = await axiosClient.get(`${API_PREFIX}/attempts`)
  return response.data
}

export const deleteAttempt = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axiosClient.delete(`${API_PREFIX}/attempts/${id}`)
  return response.data
}
