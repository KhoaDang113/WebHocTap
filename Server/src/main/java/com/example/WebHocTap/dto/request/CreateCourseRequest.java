package com.example.WebHocTap.dto.request;

import com.example.WebHocTap.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    @JsonProperty("isPrivate")
    private boolean isPrivate;
}
