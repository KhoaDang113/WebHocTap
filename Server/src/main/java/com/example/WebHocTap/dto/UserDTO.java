package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
