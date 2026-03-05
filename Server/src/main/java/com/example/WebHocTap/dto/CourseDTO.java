package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String id;
    private String title;
    private String description;
    private String teacherId;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
