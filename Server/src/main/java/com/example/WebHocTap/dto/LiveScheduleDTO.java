package com.example.WebHocTap.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveScheduleDTO {
    private String id;
    private String courseId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private String status;
    private String teacherId;
    private boolean isReminded;
}
