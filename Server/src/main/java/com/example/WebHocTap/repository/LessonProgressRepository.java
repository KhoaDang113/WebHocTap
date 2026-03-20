package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.LessonProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends MongoRepository<LessonProgress, String> {
    boolean existsByUserIdAndLessonId(String userId, String lessonId);
    List<LessonProgress> findByUserIdAndCourseId(String userId, String courseId);
    long countByUserIdAndCourseId(String userId, String courseId);
}
