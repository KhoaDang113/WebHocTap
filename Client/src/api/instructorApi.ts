import axiosClient from './axiosClient'
import type { ApiResponse, InstructorStatsDTO, InstructorStudentDTO } from '@/types'

export const instructorApi = {
  getStats: () =>
    axiosClient.get<ApiResponse<InstructorStatsDTO>>(`/instructor/stats`),
    
  getStudents: () =>
    axiosClient.get<ApiResponse<InstructorStudentDTO[]>>(`/instructor/students`),
}
