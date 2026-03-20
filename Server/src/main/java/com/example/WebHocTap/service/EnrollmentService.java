package com.example.WebHocTap.service;

import com.example.WebHocTap.common.EnrollmentStatus;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.Enrollment;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.EnrollmentRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final com.example.WebHocTap.service.LessonProgressService lessonProgressService; // Add this line

    public Enrollment enroll(String courseId) {
        String userId = getCurrentUserId();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + courseId));

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new AppException(ErrorCode.DUPLICATE, "Already enrolled in course: " + courseId);
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUserId(userId);
        enrollment.setCourseId(course.getId());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        return enrollmentRepository.save(enrollment);
    }

    public boolean isEnrolled(String courseId) {
        String userId = getCurrentUserId();

        if (!courseRepository.existsById(courseId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + courseId);
        }

        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found: " + username));
        return user.getId();
    }

    public java.util.List<com.example.WebHocTap.dto.CourseDTO> getMyEnrolledCourses() {
        String userId = getCurrentUserId();
        java.util.List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        
        java.util.List<String> courseIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(java.util.stream.Collectors.toList());
                
        java.util.List<Course> courses = courseRepository.findAllById(courseIds);
        
        return courses.stream().map(course -> {
            com.example.WebHocTap.dto.CourseDTO dto = new com.example.WebHocTap.dto.CourseDTO();
            dto.setId(course.getId());
            dto.setTitle(course.getTitle());
            dto.setDescription(course.getDescription());
            dto.setThumbnailUrl(course.getThumbnailUrl());
            dto.setPrice(course.getPrice());
            dto.setCategoryId(course.getCategoryId());
            dto.setInstructor(course.getInstructor());
            dto.setStatus(course.getStatus());
            dto.setCreatedAt(course.getCreatedAt());
            dto.setUpdatedAt(course.getUpdatedAt());
            dto.setInviteCode(course.getInviteCode());
            dto.setPrivate(course.isPrivate());
            
            // Set progress percent
            dto.setProgressPercent(lessonProgressService.getProgressPercentForUser(userId, course.getId()));
            
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    public Enrollment enrollByCode(String code) {
        Course course = courseRepository.findByInviteCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Invalid invite code"));

        String userId = getCurrentUserId();
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new AppException(ErrorCode.DUPLICATE, "Already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUserId(userId);
        enrollment.setCourseId(course.getId());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        return enrollmentRepository.save(enrollment);
    }
}

