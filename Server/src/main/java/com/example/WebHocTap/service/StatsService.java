package com.example.WebHocTap.service;

import com.example.WebHocTap.common.CourseStatus;
import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.StatsDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public StatsDTO getStats() {
        List<User> allUsers = userRepository.findAll();
        List<Course> allCourses = courseRepository.findAll();

        long totalUsers = allUsers.size();
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalTeachers = userRepository.countByRole(UserRole.TEACHER);
        long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
        long totalCourses = allCourses.size();
        long activeCourses = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.PUBLISHED).count();
        long pendingCourses = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.DRAFT).count();
        long pendingTeacherRequests = userRepository.findByPendingTeacherRequestTrue().size();

        List<StatsDTO.MonthlyCount> monthlyNewUsers = buildMonthlyUserStats(allUsers);
        List<StatsDTO.MonthlyCount> monthlyCourses = buildMonthlyCourseStats(allCourses);

        return StatsDTO.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalAdmins(totalAdmins)
                .totalCourses(totalCourses)
                .activeCourses(activeCourses)
                .pendingCourses(pendingCourses)
                .pendingTeacherRequests(pendingTeacherRequests)
                .monthlyNewUsers(monthlyNewUsers)
                .monthlyCourses(monthlyCourses)
                .build();
    }

    private List<StatsDTO.MonthlyCount> buildMonthlyUserStats(List<User> users) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> map = new LinkedHashMap<>();
        // Init last 6 months
        initLast6Months(map, fmt);
        for (User u : users) {
            if (u.getCreatedAt() != null) {
                String key = u.getCreatedAt().format(fmt);
                map.computeIfPresent(key, (k, v) -> v + 1);
            }
        }
        return toList(map);
    }

    private List<StatsDTO.MonthlyCount> buildMonthlyCourseStats(List<Course> courses) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> map = new LinkedHashMap<>();
        initLast6Months(map, fmt);
        for (Course c : courses) {
            if (c.getCreatedAt() != null) {
                String key = c.getCreatedAt().format(fmt);
                map.computeIfPresent(key, (k, v) -> v + 1);
            }
        }
        return toList(map);
    }

    private void initLast6Months(Map<String, Long> map, DateTimeFormatter fmt) {
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            map.put(now.minusMonths(i).format(fmt), 0L);
        }
    }

    private List<StatsDTO.MonthlyCount> toList(Map<String, Long> map) {
        List<StatsDTO.MonthlyCount> list = new ArrayList<>();
        map.forEach((k, v) -> list.add(new StatsDTO.MonthlyCount(k, v)));
        return list;
    }
}
