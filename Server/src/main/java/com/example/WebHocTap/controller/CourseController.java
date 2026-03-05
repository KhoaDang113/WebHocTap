package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.CourseDTO;
import com.example.WebHocTap.model.CourseModel;
import com.example.WebHocTap.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherId));
    }

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseModel model) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable String id, @RequestBody CourseModel model) {
        return ResponseEntity.ok(courseService.updateCourse(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
