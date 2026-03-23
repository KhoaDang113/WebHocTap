package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    Optional<Favorite> findByUserIdAndCourseId(String userId, String courseId);
    List<Favorite> findByUserId(String userId);
    void deleteByUserIdAndCourseId(String userId, String courseId);
}
