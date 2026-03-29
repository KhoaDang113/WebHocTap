import axiosClient from '@/api/axiosClient'
import type { ApiResponse } from '@/types'

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post<ApiResponse<string>>('/upload/image', formData)
  return response.data.data
}

export const uploadVideo = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post<ApiResponse<string>>('/upload/video', formData)
  return response.data.data
}
