package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.LessonDTO;
import com.example.WebHocTap.dto.request.LessonModel;
import com.example.WebHocTap.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LessonDTO>>> getAllLessons() {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.getAllLessons()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonDTO>> getLessonById(@PathVariable("id") String id) {   
        return ResponseEntity.ok(ApiResponse.ok(lessonService.getLessonById(id)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LessonDTO>>> getLessonsByCourse(@PathVariable("courseId") String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.getLessonsByCourse(courseId)));   
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<LessonDTO>> createLesson(@RequestBody LessonModel model) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(lessonService.createLesson(model), "Lesson created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<LessonDTO>> updateLesson(@PathVariable("id") String id, @RequestBody LessonModel model) {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.updateLesson(id, model), "Lesson updated successfully"));        
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable("id") String id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Lesson deleted successfully"));
    }
}

