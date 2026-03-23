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

    public List<ReviewDTO> getCourseReviews(String courseId) {
        return reviewRepository.findByCourseId(courseId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO mapToDTO(Review review) {
        User user = userRepository.findById(review.getUserId()).orElse(null);
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .courseId(review.getCourseId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .userFullName(user != null ? user.getFullName() : "Anonymous")
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .build();
    }
}
