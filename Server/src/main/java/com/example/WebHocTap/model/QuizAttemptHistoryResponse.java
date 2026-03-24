package com.example.WebHocTap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptHistoryResponse {
    private String id;
    private String userId;
    private String fullName;
    private String username;
    private String quizId;
    private String quizTitle;
    private String courseTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean submitted;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double score;
}
