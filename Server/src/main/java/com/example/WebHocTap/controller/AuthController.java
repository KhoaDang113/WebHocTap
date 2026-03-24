package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.AuthResponse;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.model.LoginRequest;
import com.example.WebHocTap.model.RefreshTokenRequest;
import com.example.WebHocTap.model.RegisterRequest;
import com.example.WebHocTap.model.VerifyOtpRequest;
import com.example.WebHocTap.repository.UserRepository;
import com.example.WebHocTap.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Map<String, Object> data = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole().name(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/register/request-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestRegistrationOtp(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.requestRegistrationOtp(request)));  
    }

    @PostMapping("/register/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyRegistrationOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(authService.verifyRegistrationOtp(request), "Registration successful"));
    }

    // Standard password login -> sends OTP
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    // OTP login
    @PostMapping("/login/request-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestLoginOtp(
            @RequestBody com.example.WebHocTap.model.OtpRequest request) {      
        return ResponseEntity.ok(ApiResponse.ok(authService.requestLoginOtp(request.getEmail())));
    }

    @PostMapping("/login/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyLoginOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.verifyLoginOtp(request), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refreshToken(request.getRefreshToken())));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(null, "Log out successful"));
    }
}
