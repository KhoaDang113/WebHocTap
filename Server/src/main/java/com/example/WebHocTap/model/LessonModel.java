package com.example.WebHocTap.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonModel {
    private String courseId;
    private String title;
    private String content;
    private int orderIndex;
}
