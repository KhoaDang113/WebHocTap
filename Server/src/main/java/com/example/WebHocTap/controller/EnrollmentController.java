package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.entity.Enrollment;
import com.example.WebHocTap.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Enrollment>> enroll(@PathVariable("courseId") String courseId) {
        Enrollment enrollment = enrollmentService.enroll(courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(enrollment, "Enrolled successfully"));
    }

    @GetMapping("/courses/{courseId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEnrollment(@PathVariable("courseId") String courseId) {
        boolean enrolled = enrollmentService.isEnrolled(courseId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isEnrolled", enrolled)));
    }

    @PostMapping("/join-by-code/{code}")
    public ResponseEntity<ApiResponse<Enrollment>> enrollByCode(@PathVariable("code") String code) {
        Enrollment enrollment = enrollmentService.enrollByCode(code);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(enrollment, "Joined implicitly via invite code"));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<java.util.List<com.example.WebHocTap.dto.CourseDTO>>> getMyCourses() {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getMyEnrolledCourses()));
    }
}

