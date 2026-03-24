package com.example.WebHocTap.config;

import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Optional<User> adminOpt = userRepository.findByEmail("superadmin@gmail.com");
            if (adminOpt.isEmpty()) {
                User admin = new User();
                admin.setUsername("superadmin");
                admin.setEmail("superadmin@gmail.com");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setFullName("Super Administrator");
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println("Superadmin created!");
            }
        };
    }
}