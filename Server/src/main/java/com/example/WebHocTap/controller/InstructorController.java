package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.InstructorStatsDTO;
import com.example.WebHocTap.dto.InstructorStudentDTO;
import com.example.WebHocTap.service.InstructorStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorStatsService instructorStatsService;

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InstructorStatsDTO>> getStats() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(instructorStatsService.getInstructorStats(username)));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<InstructorStudentDTO>>> getStudents() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(ApiResponse.ok(instructorStatsService.getInstructorStudents(username)));
    }
}
