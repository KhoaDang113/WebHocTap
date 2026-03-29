package com.example.WebHocTap.dto.request;

import com.example.WebHocTap.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseModel {
    private String title;
    private String description;
    private String teacherId;
    private CourseStatus status;
}
