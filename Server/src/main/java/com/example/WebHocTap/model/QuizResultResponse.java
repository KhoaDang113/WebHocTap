package com.example.WebHocTap.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    private Double score;
    private Boolean passed;
    private Integer correctAnswers;
    private Integer totalQuestions;
}

