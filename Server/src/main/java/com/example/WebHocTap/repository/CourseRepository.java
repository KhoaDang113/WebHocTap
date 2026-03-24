package com.example.WebHocTap.repository;

import com.example.WebHocTap.common.CourseStatus;
import com.example.WebHocTap.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByStatus(CourseStatus status);
    List<Course> findByCategoryId(String categoryId);
    List<Course> findByTitleContainingIgnoreCase(String title);
    java.util.Optional<Course> findByInviteCode(String inviteCode);
    List<Course> findByInstructor(String instructor);
}
