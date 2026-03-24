import axiosClient from './axiosClient';
import type { LiveScheduleDTO, CreateLiveScheduleRequest, ApiResponse } from '@/types';

export const createLiveSchedule = async (payload: CreateLiveScheduleRequest): Promise<LiveScheduleDTO> => {
  const response = await axiosClient.post<ApiResponse<LiveScheduleDTO>>('/live-schedules', payload);
  return response.data.data;
};

export const getMyLiveSchedules = async (): Promise<LiveScheduleDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LiveScheduleDTO[]>>('/live-schedules/teacher');
  return response.data.data;
};

export const getSchedulesByCourseId = async (courseId: string): Promise<LiveScheduleDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LiveScheduleDTO[]>>(`/live-schedules/course/${courseId}`);
  return response.data.data;
};

export const cancelLiveSchedule = async (id: string): Promise<void> => {
  await axiosClient.put(`/live-schedules/${id}/cancel`);
};
