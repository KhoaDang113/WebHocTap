package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsDTO {

    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long totalAdmins;
    private long totalCourses;
    private long activeCourses;
    private long pendingCourses;
    private long pendingTeacherRequests;

    private List<MonthlyCount> monthlyNewUsers;
    private List<MonthlyCount> monthlyCourses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCount {
        private String month; // e.g. "2026-01"
        private long count;
    }
}
