package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private String id;
    private String courseId;
    private String title;
    private String content;
    private int orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
