package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.QuizDTO;
import com.example.WebHocTap.model.CreateQuizRequest;
import com.example.WebHocTap.model.QuizResultResponse;
import com.example.WebHocTap.model.QuizSubmitRequest;
import com.example.WebHocTap.model.QuizTimerResponse;
import com.example.WebHocTap.model.QuizAttemptHistoryResponse;
import com.example.WebHocTap.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<QuizDTO>> createQuiz(@RequestBody CreateQuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(quizService.createQuiz(request), "Quiz created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizDTO>> getQuizById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizById(id)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<QuizDTO>>> getQuizzesByCourse(@PathVariable("courseId") String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getQuizzesByCourse(courseId)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<QuizDTO>>> getAllQuizzes() {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getAllQuizzes()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<QuizDTO>> updateQuiz(@PathVariable("id") String id, @RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.updateQuiz(id, request), "Quiz updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable("id") String id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Quiz deleted successfully"));
    }

    @PostMapping("/{quizId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuizTimerResponse>> startQuiz(@PathVariable("quizId") String quizId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.startQuiz(quizId)));
    }

    @GetMapping("/{quizId}/attempt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuizTimerResponse>> getAttempt(@PathVariable("quizId") String quizId) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getAttempt(quizId)));
    }

    @GetMapping("/my-average-score")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Double>> getMyAverageScore() {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getMyAverageScore()));
    }

    @PostMapping("/{quizId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(
            @PathVariable("quizId") String quizId,
            @RequestBody QuizSubmitRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(quizService.submitQuiz(quizId, request)));
    }

    @GetMapping("/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<QuizAttemptHistoryResponse>>> getAllAttemptsForAdmin() {
        return ResponseEntity.ok(ApiResponse.ok(quizService.getAllAttemptsForAdmin()));
    }

    @DeleteMapping("/attempts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteAttempt(@PathVariable("id") String id) {
        quizService.deleteAttempt(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Attempt deleted successfully"));
    }
}
