import axiosClient from './axiosClient';
import type { LiveSessionDTO, CreateLiveSessionRequest, ApiResponse } from '@/types';

export const getLiveSessions = async (status?: string): Promise<LiveSessionDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LiveSessionDTO[]>>('/live-sessions', {
    params: { status }
  });
  return response.data.data;
};

export const createLiveSession = async (payload: CreateLiveSessionRequest): Promise<LiveSessionDTO> => {
  const response = await axiosClient.post<ApiResponse<LiveSessionDTO>>('/live-sessions', payload);
  return response.data.data;
};

export const getSessionsByCourseId = async (courseId: string): Promise<LiveSessionDTO[]> => {
  const response = await axiosClient.get<ApiResponse<LiveSessionDTO[]>>(`/live-sessions/course/${courseId}`);
  return response.data.data;
};

export const endLiveSession = async (sessionId: string): Promise<void> => {
  await axiosClient.post(`/live-sessions/${sessionId}/end`);
};

export const joinLiveSession = async (sessionId: string): Promise<{ session: LiveSessionDTO, token: string }> => {
  const response = await axiosClient.get(`/live-sessions/${sessionId}/join`);
  return response.data.data;
};
