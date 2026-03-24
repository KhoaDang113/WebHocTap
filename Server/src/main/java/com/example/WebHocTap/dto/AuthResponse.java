package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String accessToken;
    private String refreshToken;
    private String username;
    private UserRole role;
}
