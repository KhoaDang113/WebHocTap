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
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getCourseReviews(courseId, username)));
    }

    @GetMapping("/reviews/instructor")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getInstructorReviews() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getInstructorReviews(username)));
    }

    @PatchMapping("/reviews/{reviewId}/toggle-hide")
    public ResponseEntity<ApiResponse<ReviewDTO>> toggleHideReview(@PathVariable String reviewId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(reviewService.toggleHideReview(username, reviewId)));
    }

    // COMMENTS
    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> addComment(@RequestBody CommentRequest request) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.addComment(username, request)));
    }

    @GetMapping("/comments/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getLessonComments(@PathVariable String lessonId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.getCommentsByLesson(lessonId, username)));
    }

    @GetMapping("/comments/course/{courseId}")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getCourseComments(@PathVariable String courseId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.getCommentsByCourse(courseId, username)));
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<ApiResponse<CommentDTO>> toggleLike(@PathVariable String commentId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.toggleLike(username, commentId)));
    }

    @GetMapping("/comments/instructor")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getInstructorComments() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.getInstructorComments(username)));
    }

    @PatchMapping("/comments/{commentId}/toggle-hide")
    public ResponseEntity<ApiResponse<CommentDTO>> toggleHideComment(@PathVariable String commentId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.toggleHideComment(username, commentId)));
    }

    @PatchMapping("/comments/{commentId}/toggle-pin")
    public ResponseEntity<ApiResponse<CommentDTO>> togglePinComment(@PathVariable String commentId) {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(commentService.togglePinComment(username, commentId)));
    }
}
