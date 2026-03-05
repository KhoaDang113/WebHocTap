package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.LessonDTO;
import com.example.WebHocTap.model.LessonModel;
import com.example.WebHocTap.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<List<LessonDTO>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable String id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<LessonDTO>> getLessonsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    @PostMapping
    public ResponseEntity<LessonDTO> createLesson(@RequestBody LessonModel model) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.createLesson(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable String id, @RequestBody LessonModel model) {
        return ResponseEntity.ok(lessonService.updateLesson(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable String id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
