package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.CourseDTO;
import com.example.WebHocTap.dto.request.CreateCourseRequest;
import com.example.WebHocTap.dto.request.UpdateCourseStatusRequest;
import com.example.WebHocTap.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getAllCourses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> getCourseById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getCourseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<CourseDTO>> createCourse(@RequestBody CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(courseService.createCourse(request), "Course created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<CourseDTO>> updateCourse(@PathVariable("id") String id, @RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.updateCourse(id, request), "Course updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<CourseDTO>> updateCourseStatus(@PathVariable("id") String id, @RequestBody UpdateCourseStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.updateCourseStatus(id, request), "Course status updated successfully"));
    }

    @PatchMapping("/{id}/invite-code")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<CourseDTO>> generateInviteCode(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.generateInviteCode(id), "Invite code generated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable("id") String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Course deleted successfully"));
    }
}
