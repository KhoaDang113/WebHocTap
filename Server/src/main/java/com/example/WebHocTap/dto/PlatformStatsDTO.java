package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlatformStatsDTO {
    private long totalCourses;
    private long totalStudents;
    private long totalTeachers;
}
