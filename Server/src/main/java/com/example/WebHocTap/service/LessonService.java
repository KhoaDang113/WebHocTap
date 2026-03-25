package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.LessonDTO;
import com.example.WebHocTap.entity.Lesson;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.dto.request.LessonModel;
import com.example.WebHocTap.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;

    public List<LessonDTO> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public LessonDTO getLessonById(String id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Lesson not found with id: " + id));
        return toDTO(lesson);
    }

    public List<LessonDTO> getLessonsByCourse(String courseId) {
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public LessonDTO createLesson(LessonModel model) {
        Lesson lesson = new Lesson();
        lesson.setCourseId(model.getCourseId());
        lesson.setTitle(model.getTitle());
        lesson.setContent(model.getContent());
        lesson.setOrderIndex(model.getOrderIndex());
        lesson.setVideoUrl(model.getVideoUrl());
        lesson.setImageUrl(model.getImageUrl());

        return toDTO(lessonRepository.save(lesson));
    }

    public LessonDTO updateLesson(String id, LessonModel model) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Lesson not found with id: " + id));

        lesson.setCourseId(model.getCourseId());
        lesson.setTitle(model.getTitle());
        lesson.setContent(model.getContent());
        lesson.setOrderIndex(model.getOrderIndex());
        lesson.setVideoUrl(model.getVideoUrl());
        lesson.setImageUrl(model.getImageUrl());

        return toDTO(lessonRepository.save(lesson));
    }

    public void deleteLesson(String id) {
        if (!lessonRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Lesson not found with id: " + id);
        }
        lessonRepository.deleteById(id);
    }

    private LessonDTO toDTO(Lesson lesson) {
        LessonDTO dto = new LessonDTO();
        dto.setId(lesson.getId());
        dto.setCourseId(lesson.getCourseId());
        dto.setTitle(lesson.getTitle());
        dto.setContent(lesson.getContent());
        dto.setOrderIndex(lesson.getOrderIndex());
        dto.setVideoUrl(lesson.getVideoUrl());
        dto.setImageUrl(lesson.getImageUrl());
        dto.setCreatedAt(lesson.getCreatedAt());
        dto.setUpdatedAt(lesson.getUpdatedAt());
        return dto;
    }
}
