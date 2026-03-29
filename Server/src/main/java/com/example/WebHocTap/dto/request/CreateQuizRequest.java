package com.example.WebHocTap.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    private String courseId;
    private String title;
    private Integer timeLimit;
    private Integer maxAttempts;
    private String status;
    private List<CreateQuestionRequest> questions;
}
