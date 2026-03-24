import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import type { ApiResponse, ReviewDTO, CommentDTO } from "../types";

export const useInstructorReviews = () => {
    return useQuery({
        queryKey: ["instructor-reviews"],
        queryFn: async () => {
            const res = await axiosClient.get<ApiResponse<ReviewDTO[]>>("/interactions/reviews/instructor");
            return res.data.data;
        },
    });
};

export const useInstructorComments = () => {
    return useQuery({
        queryKey: ["instructor-comments"],
        queryFn: async () => {
            const res = await axiosClient.get<ApiResponse<CommentDTO[]>>("/interactions/comments/instructor");
            return res.data.data;
        },
    });
};

export const useToggleHideReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: string) => {
            await axiosClient.patch(`/interactions/reviews/${reviewId}/toggle-hide`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instructor-reviews"] });
        },
    });
};

export const useToggleHideComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (commentId: string) => {
            await axiosClient.patch(`/interactions/comments/${commentId}/toggle-hide`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instructor-comments"] });
        },
    });
};
