package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {

    Optional<QuizAttempt> findByQuizIdAndUserId(String quizId, String userId);
}

