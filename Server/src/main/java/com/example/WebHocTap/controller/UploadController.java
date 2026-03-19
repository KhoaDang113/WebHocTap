package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = uploadService.uploadImage(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(imageUrl, "Image uploaded successfully"));
    }

    @PostMapping("/video")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        String videoUrl = uploadService.uploadVideo(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(videoUrl, "Video uploaded successfully"));
    }
}
