package com.example.WebHocTap.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private String lessonId;
    private String content;
    private String parentId;
}
