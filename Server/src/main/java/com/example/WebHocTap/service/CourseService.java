package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.CourseDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.CourseModel;
import com.example.WebHocTap.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

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

    public List<CourseDTO> getCoursesByTeacher(String teacherId) {
        return courseRepository.findByTeacherId(teacherId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO createCourse(CourseModel model) {
        Course course = new Course();
        course.setTitle(model.getTitle());
        course.setDescription(model.getDescription());
        course.setTeacherId(model.getTeacherId());
        course.setStatus(model.getStatus());

        return toDTO(courseRepository.save(course));
    }

    public CourseDTO updateCourse(String id, CourseModel model) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found with id: " + id));

        course.setTitle(model.getTitle());
        course.setDescription(model.getDescription());
        course.setTeacherId(model.getTeacherId());
        course.setStatus(model.getStatus());

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
        dto.setTeacherId(course.getTeacherId());
        dto.setStatus(course.getStatus());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        return dto;
    }
}
