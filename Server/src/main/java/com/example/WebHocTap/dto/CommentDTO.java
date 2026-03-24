package com.example.WebHocTap.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private String userId;
    private String lessonId; // null if course level
    private String courseId;
    private String content;
    private String parentId;
    private List<String> likes;
    private LocalDateTime createdAt;
    
    private String userFullName;
    private String userAvatar;
    private List<CommentDTO> replies;
    private String lessonTitle;
    private String courseTitle;
    
    @JsonProperty("isHidden")
    private boolean hidden;

    @JsonProperty("isPinned")
    private boolean pinned;

    private String userRole; // ADMIN, INSTRUCTOR, STUDENT, GUEST
}
