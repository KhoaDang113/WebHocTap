package com.example.WebHocTap.dto;

import com.example.WebHocTap.common.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String avatarUrl;
    private String bio;
    private UserRole role;

    @JsonProperty("isLocked")
    private boolean isLocked;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    @JsonProperty("pendingTeacherRequest")
    private boolean pendingTeacherRequest;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
