package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.LiveSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiveSessionRepository extends MongoRepository<LiveSession, String> {
    Optional<LiveSession> findByIdAndStatus(String id, String status);
    List<LiveSession> findByCourseId(String courseId);
}
