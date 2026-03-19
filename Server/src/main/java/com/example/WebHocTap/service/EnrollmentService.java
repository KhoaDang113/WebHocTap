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
}

