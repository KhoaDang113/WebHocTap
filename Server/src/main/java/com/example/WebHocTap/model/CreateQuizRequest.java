package com.example.WebHocTap.model;

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
    private List<CreateQuestionRequest> questions;
}
