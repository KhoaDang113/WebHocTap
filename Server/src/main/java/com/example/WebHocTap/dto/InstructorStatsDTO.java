package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStatsDTO {
    private long totalCourses;
    private long totalStudents;
    private long totalReviews;
    private double averageRating;
}
