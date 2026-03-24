package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStudentDTO {
    private String userId;
    private String fullName;
    private String email;
    private String courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private double progressPercent;
}
