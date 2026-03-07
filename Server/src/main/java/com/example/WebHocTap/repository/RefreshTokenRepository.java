package com.example.WebHocTap.repository;

import com.example.WebHocTap.entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUsername(String username);
}
