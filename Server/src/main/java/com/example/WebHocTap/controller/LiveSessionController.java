package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.LiveSessionDTO;
import com.example.WebHocTap.dto.LiveSessionJoinResponse;
import com.example.WebHocTap.dto.request.CreateLiveSessionRequest;
import com.example.WebHocTap.service.LiveSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/v1/live-sessions")
@RequiredArgsConstructor
public class LiveSessionController {

    private final LiveSessionService liveSessionService;

    // Giảng viên tạo phòng
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LiveSessionDTO>> createSession(@RequestBody CreateLiveSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(liveSessionService.createSession(request), "Live session created successfully"));
    }

    // Học sinh hoặc giảng viên tham gia phòng (Lấy Token + thông tin phòng)
    @GetMapping("/{id}/join")
    public ResponseEntity<ApiResponse<LiveSessionJoinResponse>> joinSession(@PathVariable("id") String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(liveSessionService.joinSession(sessionId), "Live session joined successfully"));
    }

    // Lấy danh sách các buổi live trong một khóa học (cho Dashboard hoặc chi tiết khóa học)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LiveSessionDTO>>> getSessionsByCourseId(@PathVariable("courseId") String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(liveSessionService.getSessionsByCourseId(courseId)));
    }

    // Giảng viên kết thúc session thủ công
    @PostMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> endSession(@PathVariable("id") String sessionId) {
        liveSessionService.endSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Live session ended successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<LiveSessionDTO>>> getAllSessions(
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(liveSessionService.getAllSessions(status)));
    }
    
}
