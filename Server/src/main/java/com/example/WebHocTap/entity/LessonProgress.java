package com.example.WebHocTap.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "lesson_progress")
@CompoundIndex(name = "uq_user_lesson", def = "{'userId': 1, 'lessonId': 1}", unique = true)
public class LessonProgress {

    @Id
    private String id;

    private String userId;

    private String courseId;

    private String lessonId;

    @CreatedDate
    private LocalDateTime completedAt;
}
