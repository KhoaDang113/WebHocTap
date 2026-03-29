package com.example.WebHocTap.service;

import com.example.WebHocTap.common.CourseStatus;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.CourseDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.dto.request.CreateCourseRequest;
import com.example.WebHocTap.dto.request.UpdateCourseStatusRequest;
import com.example.WebHocTap.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final com.example.WebHocTap.repository.ReviewRepository reviewRepository;

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id));
        return toDTO(course);
    }

    public List<CourseDTO> getCoursesByCategoryId(String categoryId) {
        return courseRepository.findByCategoryId(categoryId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO createCourse(CreateCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setPrice(request.getPrice());
        course.setCategoryId(request.getCategoryId());
        course.setInstructor(request.getInstructor());
        course.setStatus(request.getStatus() != null ? request.getStatus() : CourseStatus.DRAFT);
        course.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        course.setPrivate(request.isPrivate());

        return toDTO(courseRepository.save(course));
    }

    public CourseDTO updateCourse(String id, CreateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setPrice(request.getPrice());
        course.setCategoryId(request.getCategoryId());
        course.setInstructor(request.getInstructor());
        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }
        course.setPrivate(request.isPrivate());

        return toDTO(courseRepository.save(course));
    }

    public CourseDTO updateCourseStatus(String id, UpdateCourseStatusRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id));

        course.setStatus(request.getStatus());
        return toDTO(courseRepository.save(course));
    }

    public CourseDTO generateInviteCode(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id));

        course.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return toDTO(courseRepository.save(course));
    }

    public void deleteCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    private CourseDTO toDTO(Course course) {
        CourseDTO dto = new CourseDTO();
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

        // Aggregate review ratings
        java.util.List<com.example.WebHocTap.entity.Review> reviews = reviewRepository.findByCourseId(course.getId());
        double avg = reviews.stream().filter(r -> !r.isHidden()).mapToDouble(com.example.WebHocTap.entity.Review::getRating).average().orElse(0.0);
        dto.setAverageRating(Math.round(avg * 10.0) / 10.0); // 1 decimal
        dto.setReviewCount((int) reviews.stream().filter(r -> !r.isHidden()).count());

        return dto;
    }
}
