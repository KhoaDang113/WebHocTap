package com.example.WebHocTap.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "live_schedules")
public class LiveSchedule {
    @Id
    private String id;
    
    private String courseId;
    private String title;
    private String description;
    
    private LocalDateTime startTime;
    
    // SCHEDULED, DONE, CANCELLED
    private String status;
    
    private String teacherId;
    
    private boolean isReminded;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
