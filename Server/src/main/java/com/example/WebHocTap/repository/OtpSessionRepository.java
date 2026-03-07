package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.OtpSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpSessionRepository extends MongoRepository<OtpSession, String> {
    Optional<OtpSession> findByEmailAndPurposeAndIsUsedFalse(String email, String purpose);
}
