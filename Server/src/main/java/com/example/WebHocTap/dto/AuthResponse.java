package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String accessToken;
    private String refreshToken;
    private String username;
    private UserRole role;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
