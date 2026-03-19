package com.example.WebHocTap.repository;

import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByPendingTeacherRequestTrue();
    long countByRole(UserRole role);
}
