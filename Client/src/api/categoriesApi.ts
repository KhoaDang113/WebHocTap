import axiosClient from '@/api/axiosClient'
import type { ApiResponse, CategoryDTO } from '@/types'

const CATEGORY_API_PATH = '/categories'

export interface CategoryPayload {
  name: string
  description: string
}

export const getCategories = async (): Promise<CategoryDTO[]> => {
  const response = await axiosClient.get<ApiResponse<CategoryDTO[]>>(CATEGORY_API_PATH)
  return response.data.data
}

export const getCategoryById = async (id: string): Promise<CategoryDTO> => {
  const response = await axiosClient.get<ApiResponse<CategoryDTO>>(`${CATEGORY_API_PATH}/${id}`)
  return response.data.data
}

export const createCategory = async (payload: CategoryPayload): Promise<CategoryDTO> => {
  const response = await axiosClient.post<ApiResponse<CategoryDTO>>(CATEGORY_API_PATH, payload)
  return response.data.data
}

export const updateCategory = async (id: string, payload: CategoryPayload): Promise<CategoryDTO> => {
  const response = await axiosClient.put<ApiResponse<CategoryDTO>>(`${CATEGORY_API_PATH}/${id}`, payload)
  return response.data.data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`${CATEGORY_API_PATH}/${id}`)
}
