import axiosClient from '@/api/axiosClient'
import type { ApiResponse } from '@/types'

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post<ApiResponse<string>>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export const uploadVideo = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post<ApiResponse<string>>('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}
