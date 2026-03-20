package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private String categoryId;
    private String instructor;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String inviteCode;
    
    @JsonProperty("isPrivate")
    private boolean isPrivate;

    private Double progressPercent; // Add this line
}
