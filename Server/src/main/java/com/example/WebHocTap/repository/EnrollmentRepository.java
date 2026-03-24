package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
    boolean existsByUserIdAndCourseId(String userId, String courseId);
    Optional<Enrollment> findByUserIdAndCourseId(String userId, String courseId);
    List<Enrollment> findByUserId(String userId);
    List<Enrollment> findByCourseIdIn(List<String> courseIds);
    List<Enrollment> findByCourseId(String courseId);
}

