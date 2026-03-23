package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.*;
import com.example.WebHocTap.service.CommentService;
import com.example.WebHocTap.service.FavoriteService;
import com.example.WebHocTap.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final FavoriteService favoriteService;
    private final ReviewService reviewService;
    private final CommentService commentService;

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
    }

    // FAVORITES
    @PostMapping("/favorites/toggle")
    public ResponseEntity<ApiResponse<FavoriteDTO>> toggleFavorite(@RequestBody FavoriteRequest request) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.toggleFavorite(username, request.getCourseId())));
    }

    @GetMapping("/favorites/check/{courseId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFavorite(@PathVariable String courseId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.checkFavorite(username, courseId)));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getFavorites() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.getFavoriteCourses(username)));
    }

    // REVIEWS
    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewDTO>> addReview(@RequestBody ReviewRequest request) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(reviewService.addReview(username, request)));
    }

    @GetMapping("/reviews/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getCourseReviews(@PathVariable String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getCourseReviews(courseId)));
    }

    // COMMENTS
    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> addComment(@RequestBody CommentRequest request) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.addComment(username, request)));
    }

    @GetMapping("/comments/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getLessonComments(@PathVariable String lessonId) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.getCommentsByLesson(lessonId)));
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<ApiResponse<CommentDTO>> toggleLike(@PathVariable String commentId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.toggleLike(username, commentId)));
    }
}
