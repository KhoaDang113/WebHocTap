package com.example.WebHocTap.service;

import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.ReviewDTO;
import com.example.WebHocTap.dto.ReviewRequest;
import com.example.WebHocTap.entity.Review;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.EnrollmentRepository;
import com.example.WebHocTap.repository.ReviewRepository;
import com.example.WebHocTap.repository.UserRepository;
import com.example.WebHocTap.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public ReviewDTO addReview(String username, ReviewRequest request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found with username: " + username));

        // Only students can review
        if (user.getRole() != UserRole.STUDENT) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only students can review a course");
        }

        // Check if enrolled using ID
        if (!enrollmentRepository.existsByUserIdAndCourseId(user.getId(), request.getCourseId())) {
            throw new AppException(ErrorCode.FORBIDDEN, 
                String.format("You must enroll in course [%s] to review it. (User ID: %s)", request.getCourseId(), user.getId()));
        }

        // Check if already reviewed using ID (consistent storage)
        if (reviewRepository.existsByUserIdAndCourseId(user.getId(), request.getCourseId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "You have already reviewed this course");
        }

        Review review = Review.builder()
                .userId(user.getId()) // Store ID instead of username
                .courseId(request.getCourseId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        
        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    public List<ReviewDTO> getInstructorReviews(String instructorUsername) {
        List<com.example.WebHocTap.entity.Course> instructorCourses = courseRepository.findByInstructor(instructorUsername);
        List<String> courseIds = instructorCourses.stream()
                .map(com.example.WebHocTap.entity.Course::getId)
                .collect(Collectors.toList());
        
        return reviewRepository.findByCourseIdIn(courseIds)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO toggleHideReview(String username, String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Review not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
        
        com.example.WebHocTap.entity.Course course = courseRepository.findById(review.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));
        
        // Allowed if user is Admin OR course owner
        if (user.getRole() != UserRole.ADMIN && !course.getInstructor().equals(username)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You don't have permission to manage this review");
        }
        
        review.setHidden(!review.isHidden());
        return mapToDTO(reviewRepository.save(review));
    }

    public List<ReviewDTO> getCourseReviews(String courseId, String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        String currentUserId = currentUser != null ? currentUser.getId() : null;

        return reviewRepository.findByCourseId(courseId)
                .stream()
                .filter(r -> !r.isHidden() || (currentUserId != null && r.getUserId().equals(currentUserId)))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO mapToDTO(Review review) {
        User user = userRepository.findById(review.getUserId()).orElse(null);
        com.example.WebHocTap.entity.Course course = courseRepository.findById(review.getCourseId()).orElse(null);
        
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .courseId(review.getCourseId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .userFullName(user != null ? user.getFullName() : "Anonymous")
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .courseTitle(course != null ? course.getTitle() : "Unknown Course")
                .hidden(review.isHidden())
                .build();
    }
}
