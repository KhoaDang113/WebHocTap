package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {

    Optional<QuizAttempt> findByQuizIdAndUserId(String quizId, String userId);
    
    Optional<QuizAttempt> findByQuizIdAndUserIdAndSubmittedFalse(String quizId, String userId);

    java.util.List<QuizAttempt> findAllByQuizIdAndUserId(String quizId, String userId);

    java.util.List<QuizAttempt> findByUserIdAndSubmittedTrue(String userId);
}

