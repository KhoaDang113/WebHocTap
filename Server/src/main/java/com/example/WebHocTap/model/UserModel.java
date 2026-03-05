package com.example.WebHocTap.model;

import com.example.WebHocTap.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserModel {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private UserRole role;
}
