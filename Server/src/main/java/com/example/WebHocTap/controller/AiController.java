package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.request.CreateQuestionRequest;
import com.example.WebHocTap.dto.request.AiQuizGenerateRequest;
import com.example.WebHocTap.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-quiz")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<CreateQuestionRequest>>> generateQuiz(
            @RequestBody AiQuizGenerateRequest request) {
        
        List<CreateQuestionRequest> generatedQuestions = aiService.generateQuestions(request);
        return ResponseEntity.ok(ApiResponse.ok(generatedQuestions, "AI generated quiz successfully"));
    }
}
