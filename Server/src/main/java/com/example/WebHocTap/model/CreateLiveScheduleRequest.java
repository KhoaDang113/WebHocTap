package com.example.WebHocTap.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateLiveScheduleRequest {
    private String courseId;
    private String title;
    private String description;
    private LocalDateTime startTime;
}
