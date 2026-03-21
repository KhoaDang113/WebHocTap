package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.entity.LessonProgress;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.LessonProgressRepository;
import com.example.WebHocTap.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final com.example.WebHocTap.repository.EnrollmentRepository enrollmentRepository; // Add this line
    private final com.example.WebHocTap.repository.UserRepository userRepository; // Add this line

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }

        String username = authentication.getName();
        com.example.WebHocTap.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found: " + username));
        return user.getId();
    }

    public LessonProgress completeLesson(String courseId, String lessonId) {
        String userId = getCurrentUserId();

        // Check if enrolled
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Not enrolled in this course");
        }

        // Check if lesson exists in this course
        boolean lessonExists = lessonRepository.findById(lessonId)
                .map(l -> l.getCourseId().equals(courseId))
                .orElse(false);

        if (!lessonExists) {
            throw new AppException(ErrorCode.NOT_FOUND, "Lesson not found in this course");
        }

        if (lessonProgressRepository.existsByUserIdAndLessonId(userId, lessonId)) {
            // Already completed, just return existing or update timestamp
            return lessonProgressRepository.findByUserIdAndCourseId(userId, courseId)
                    .stream()
                    .filter(p -> p.getLessonId().equals(lessonId))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Progress data inconsistency"));
        }

        LessonProgress progress = new LessonProgress();
        progress.setUserId(userId);
        progress.setCourseId(courseId);
        progress.setLessonId(lessonId);
        progress.setCompletedAt(LocalDateTime.now());

        return lessonProgressRepository.save(progress);
    }

    public Map<String, Object> getCourseProgress(String courseId) {
        String userId = getCurrentUserId();

        List<LessonProgress> completed = lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);
        List<String> completedLessonIds = completed.stream()
                .map(LessonProgress::getLessonId)
                .collect(Collectors.toList());

        long totalLessons = lessonRepository.findByCourseId(courseId).size();
        double progressPercent = totalLessons == 0 ? 0 : (double) completedLessonIds.size() / totalLessons * 100;

        Map<String, Object> result = new HashMap<>();
        result.put("completedLessonIds", completedLessonIds);
        result.put("progressPercent", Math.round(progressPercent * 100.0) / 100.0); // Round to 2 decimals

        return result;
    }

    public double getProgressPercentForUser(String userId, String courseId) {
        long totalLessons = lessonRepository.findByCourseId(courseId).size();
        if (totalLessons == 0) return 0.0;
        
        long completedLessons = lessonProgressRepository.countByUserIdAndCourseId(userId, courseId);
        double percent = (double) completedLessons / totalLessons * 100.0;
        return Math.round(percent * 100.0) / 100.0;
    }
}
