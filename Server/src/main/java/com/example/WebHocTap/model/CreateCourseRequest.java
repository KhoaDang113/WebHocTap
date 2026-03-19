package com.example.WebHocTap.model;

import com.example.WebHocTap.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCourseRequest {
    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private String categoryId;
    private String instructor;
    private CourseStatus status;
}
