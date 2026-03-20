package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.entity.LessonProgress;
import com.example.WebHocTap.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<LessonProgress>> completeLesson(
            @PathVariable("courseId") String courseId,
            @PathVariable("lessonId") String lessonId) {
        LessonProgress progress = lessonProgressService.completeLesson(courseId, lessonId);
        return ResponseEntity.ok(ApiResponse.ok(progress, "Lesson marked as completed"));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourseProgress(
            @PathVariable("courseId") String courseId) {
        Map<String, Object> progress = lessonProgressService.getCourseProgress(courseId);
        return ResponseEntity.ok(ApiResponse.ok(progress));
    }
}
