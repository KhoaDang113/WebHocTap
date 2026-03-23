package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveSessionDTO {
    private String id;
    private String title;
    private String courseId;
    private String description;
    private String roomName;
    private String status;
    private String createdAt;
}
