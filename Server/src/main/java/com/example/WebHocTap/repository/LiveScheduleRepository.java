package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.LiveSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LiveScheduleRepository extends MongoRepository<LiveSchedule, String> {
    List<LiveSchedule> findByTeacherId(String teacherId);
    List<LiveSchedule> findByCourseId(String courseId);
    List<LiveSchedule> findByStartTimeBetweenAndIsRemindedFalseAndStatus(LocalDateTime start, LocalDateTime end, String status);
}
