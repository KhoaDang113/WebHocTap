package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.UserDTO;
import com.example.WebHocTap.model.ChangePasswordRequest;
import com.example.WebHocTap.model.UpdateProfileRequest;
import com.example.WebHocTap.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserDTO> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request-teacher")
    public ResponseEntity<Void> requestTeacherRole() {
        userService.requestTeacherRole();
        return ResponseEntity.ok().build();
    }
}
