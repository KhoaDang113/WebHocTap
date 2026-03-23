package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByLessonIdAndParentIdIsNullOrderByCreatedAtDesc(String lessonId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(String parentId);
}
