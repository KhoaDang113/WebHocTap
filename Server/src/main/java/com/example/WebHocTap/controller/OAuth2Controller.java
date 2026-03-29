package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
import com.example.WebHocTap.dto.AuthResponse;
import com.example.WebHocTap.dto.request.FacebookLoginRequest;
import com.example.WebHocTap.dto.request.GoogleLoginRequest;
import com.example.WebHocTap.service.OAuth2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2Service oAuth2Service;

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(oAuth2Service.loginWithGoogle(request.getIdToken())));                                                                              }

    @PostMapping("/facebook")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithFacebook(@RequestBody FacebookLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(oAuth2Service.loginWithFacebook(request.getAccessToken())));                                                                        }
}
