package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends MongoRepository<Lesson, String> {
    List<Lesson> findByCourseIdOrderByOrderIndexAsc(String courseId);
    List<Lesson> findByCourseId(String courseId);
}
