package com.example.WebHocTap.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateLiveScheduleRequest {
    private String courseId;
    private String title;
    private String description;
    private LocalDateTime startTime;
}
