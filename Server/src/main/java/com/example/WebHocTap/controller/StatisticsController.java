package com.example.WebHocTap.controller;

import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.PlatformStatsDTO;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @GetMapping("/platform")
    public ResponseEntity<ApiResponse<PlatformStatsDTO>> getPlatformStats() {
        long totalCourses = courseRepository.count();
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalTeachers = userRepository.countByRole(UserRole.TEACHER) + userRepository.countByRole(UserRole.ADMIN);

        PlatformStatsDTO stats = new PlatformStatsDTO(totalCourses, totalStudents, totalTeachers);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
