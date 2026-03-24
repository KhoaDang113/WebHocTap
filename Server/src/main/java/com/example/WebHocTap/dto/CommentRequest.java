package com.example.WebHocTap.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CommentRequest {
    @JsonProperty("courseId")
    private String courseId; // Bắt buộc

    @JsonProperty("lessonId")
    private String lessonId; // Tùy chọn

    private String content;
    private String parentId;
}
