import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types';

export interface AiQuizGenerateRequest {
  topic: string;
  numQuestions: number;
}

export interface CreateAnswerRequest {
  content: string;
  isCorrect: boolean;
}

export interface CreateQuestionRequest {
  content: string;
  answers: CreateAnswerRequest[];
}

export const generateQuizQuestions = async (payload: AiQuizGenerateRequest): Promise<CreateQuestionRequest[]> => {
  const response = await axiosClient.post<ApiResponse<CreateQuestionRequest[]>>('/ai/generate-quiz', payload);
  return response.data.data;
};
