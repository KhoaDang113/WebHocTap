package com.example.WebHocTap.dto;

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
    private String lessonId;
    private String content;
    private String parentId;
    private List<String> likes;
    private LocalDateTime createdAt;
    
    private String userFullName;
    private String userAvatar;
    private List<CommentDTO> replies;
}
