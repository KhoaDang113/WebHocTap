package com.example.WebHocTap.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private String id;
    private String userId;
    private String courseId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private String userFullName;
    private String userAvatar;
    private String courseTitle;
    
    @JsonProperty("isHidden")
    private boolean hidden;
}
