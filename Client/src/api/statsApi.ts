import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types'

export interface PlatformStats {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<PlatformStats>>('/stats/platform')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
