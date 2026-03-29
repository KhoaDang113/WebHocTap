package com.example.WebHocTap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTimerResponse {
    private Long remainingTime;
    private Boolean submitted;
    private String status;
    private Double score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer maxAttempts;
    private Integer attemptCount;
}
