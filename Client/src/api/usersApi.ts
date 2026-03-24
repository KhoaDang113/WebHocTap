import axiosClient from './axiosClient'
import type { ApiResponse, UserDTO, UserPayload } from '@/types'

const USERS = '/users'

export const usersApi = {
  getAll: async (): Promise<UserDTO[]> => {
    const res = await axiosClient.get<ApiResponse<UserDTO[]>>(USERS)
    return res.data.data
  },

  getById: async (id: string): Promise<UserDTO> => {
    const res = await axiosClient.get<ApiResponse<UserDTO>>(`${USERS}/${id}`)
    return res.data.data
  },

  create: async (data: UserPayload): Promise<UserDTO> => {
    const res = await axiosClient.post<ApiResponse<UserDTO>>(USERS, data)
    return res.data.data
  },

  update: async (id: string, data: UserPayload): Promise<UserDTO> => {
    const res = await axiosClient.put<ApiResponse<UserDTO>>(`${USERS}/${id}`, data)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`${USERS}/${id}`)
  },

  lock: async (id: string): Promise<UserDTO> => {
    const res = await axiosClient.put<ApiResponse<UserDTO>>(`${USERS}/${id}/lock`)
    return res.data.data
  },

  unlock: async (id: string): Promise<UserDTO> => {
    const res = await axiosClient.put<ApiResponse<UserDTO>>(`${USERS}/${id}/unlock`)
    return res.data.data
  },
}
