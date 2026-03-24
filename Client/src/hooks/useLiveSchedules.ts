import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createLiveSchedule, 
  getMyLiveSchedules, 
  getSchedulesByCourseId,
  cancelLiveSchedule
} from "@/api/liveScheduleApi";
import type { CreateLiveScheduleRequest } from "@/types";

export const LIVE_SCHEDULES_QUERY_KEY = ["live-schedules"];

export const useMyLiveSchedules = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...LIVE_SCHEDULES_QUERY_KEY, "teacher"],
    queryFn: () => getMyLiveSchedules(),
    enabled: options?.enabled,
  });
};

export const useCourseLiveSchedules = (courseId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...LIVE_SCHEDULES_QUERY_KEY, courseId],
    queryFn: () => getSchedulesByCourseId(courseId),
    enabled: !!courseId && (options?.enabled ?? true),
  });
};

export const useCreateLiveSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateLiveScheduleRequest) => createLiveSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_SCHEDULES_QUERY_KEY });
    },
  });
};

export const useCancelLiveSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cancelLiveSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_SCHEDULES_QUERY_KEY });
    },
  });
};
