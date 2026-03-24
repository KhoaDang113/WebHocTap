package com.example.WebHocTap.service;

import com.example.WebHocTap.dto.InstructorStatsDTO;
import com.example.WebHocTap.dto.InstructorStudentDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.Enrollment;
import com.example.WebHocTap.entity.Review;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.EnrollmentRepository;
import com.example.WebHocTap.repository.ReviewRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorStatsService {
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LessonProgressService lessonProgressService;

    public InstructorStatsDTO getInstructorStats(String username) {
        List<Course> courses = courseRepository.findByInstructor(username);
        List<String> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());

        long totalCourses = courses.size();
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdIn(courseIds);
        long totalStudents = enrollments.stream().map(Enrollment::getUserId).distinct().count();

        List<Review> reviews = reviewRepository.findByCourseIdIn(courseIds);
        long totalReviews = reviews.size();
        
        double averageRating = reviews.isEmpty() 
            ? 0.0 
            : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        return InstructorStatsDTO.builder()
                .totalCourses(totalCourses)
                .totalStudents(totalStudents)
                .totalReviews(totalReviews)
                .averageRating(Math.round(averageRating * 10.0) / 10.0)
                .build();
    }

    public List<InstructorStudentDTO> getInstructorStudents(String username) {
        List<Course> courses = courseRepository.findByInstructor(username);
        List<String> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());

        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdIn(courseIds);
        enrollments.sort((a, b) -> b.getEnrolledAt().compareTo(a.getEnrolledAt()));

        return enrollments.stream().map(enrollment -> {
            User user = userRepository.findById(enrollment.getUserId()).orElse(null);
            Course course = courses.stream()
                .filter(c -> c.getId().equals(enrollment.getCourseId()))
                .findFirst()
                .orElse(null);
                
            String userId = user != null ? user.getId() : "";
            double progress = userId.isEmpty() ? 0 : lessonProgressService.getProgressPercentForUser(userId, enrollment.getCourseId());

            return InstructorStudentDTO.builder()
                    .userId(enrollment.getUserId())
                    .fullName(user != null ? user.getFullName() : "Unknown")
                    .email(user != null ? user.getEmail() : "")
                    .courseId(enrollment.getCourseId())
                    .courseTitle(course != null ? course.getTitle() : "Unknown Course")
                    .enrolledAt(enrollment.getEnrolledAt())
                    .progressPercent(progress)
                    .build();
        }).collect(Collectors.toList());
    }
}
