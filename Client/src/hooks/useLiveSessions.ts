import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLiveSessions, createLiveSession, endLiveSession, getSessionsByCourseId } from "@/api/liveSessionApi";
import type { CreateLiveSessionRequest } from "@/types";

export const LIVE_SESSIONS_QUERY_KEY = ["live-sessions"];

// Fetch all sessions (Admin sees all, Teacher sees their own)
export const useLiveSessions = (options?: { enabled?: boolean; status?: string }) => {
  return useQuery({
    queryKey: options?.status ? [...LIVE_SESSIONS_QUERY_KEY, { status: options.status }] : LIVE_SESSIONS_QUERY_KEY,
    queryFn: () => getLiveSessions(options?.status),
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch sessions for a specific course
export const useCourseLiveSessions = (courseId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...LIVE_SESSIONS_QUERY_KEY, courseId],
    queryFn: () => getSessionsByCourseId(courseId),
    enabled: !!courseId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};

// Create a new Live Session
export const useCreateLiveSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateLiveSessionRequest) => createLiveSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_SESSIONS_QUERY_KEY });
    },
  });
};

// End a Live Session
export const useEndLiveSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => endLiveSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_SESSIONS_QUERY_KEY });
    },
  });
};
