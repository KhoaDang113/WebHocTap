package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.LiveScheduleDTO;
import com.example.WebHocTap.model.CreateLiveScheduleRequest;
import com.example.WebHocTap.service.LiveScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/live-schedules")
@RequiredArgsConstructor
public class LiveScheduleController {

    private final LiveScheduleService liveScheduleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LiveScheduleDTO>> createSchedule(@RequestBody CreateLiveScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(liveScheduleService.createSchedule(request), "Schedule created successfully"));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LiveScheduleDTO>>> getMySchedules() {
        return ResponseEntity.ok(ApiResponse.ok(liveScheduleService.getMySchedules()));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LiveScheduleDTO>>> getSchedulesByCourseId(@PathVariable("courseId") String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(liveScheduleService.getSchedulesByCourseId(courseId)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelSchedule(@PathVariable("id") String id) {
        liveScheduleService.cancelSchedule(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Schedule cancelled successfully"));
    }
}
