package com.example.WebHocTap.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private String courseId;
    private int rating;
    private String comment;
}
