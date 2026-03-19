import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import type { UserDTO, ApiResponse } from '@/types'

type UseUsersOptions = {
  enabled?: boolean
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const hasAccessToken = Boolean(localStorage.getItem('accessToken'))

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<UserDTO[]>>('/users')
      return response.data.data
    },
    enabled: (options.enabled ?? true) && hasAccessToken,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}
