package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.AuthResponse;
import com.example.WebHocTap.entity.RefreshToken;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.RefreshTokenRepository;
import com.example.WebHocTap.repository.UserRepository;
import com.example.WebHocTap.security.JwtUtil;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${oauth2.google.client-id}")
    private String googleClientId;

    @Value("${oauth2.facebook.app-id}")
    private String facebookAppId;

    @Value("${oauth2.facebook.app-secret}")
    private String facebookAppSecret;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private final RestTemplate restTemplate = new RestTemplate();

    // --- Google Login ---

    public AuthResponse loginWithGoogle(String idToken) {
        // Verify Google ID token
        Map<String, Object> tokenInfo;
        try {
            tokenInfo = restTemplate.getForObject("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken,
                    Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.UNAUTHORIZED, "Lỗi kết nối Google: " + e.getMessage());
        }

        if (tokenInfo == null || tokenInfo.containsKey("error")) {
            throw new AppException(ErrorCode.UNAUTHORIZED,
                    "Google trả về lỗi token: " + (tokenInfo != null ? tokenInfo.toString() : "null"));
        }

        // Verify the token was issued for our app
        String aud = tokenInfo.containsKey("aud") ? String.valueOf(tokenInfo.get("aud")) : "";
        if (!googleClientId.equals(aud)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token không thuộc ứng dụng này");
        }

        String email = String.valueOf(tokenInfo.get("email"));
        String name = tokenInfo.containsKey("name") ? String.valueOf(tokenInfo.get("name")) : email.split("@")[0];

        return findOrCreateUserAndLogin(email, name, "GOOGLE");
    }

    // --- Facebook Login ---

    public AuthResponse loginWithFacebook(String accessToken) {
        // Verify Facebook access token and get user info
        Map<String, Object> userInfo;
        try {
            userInfo = restTemplate.getForObject(
                    "https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken, Map.class);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token Facebook không hợp lệ");
        }

        if (userInfo == null || userInfo.containsKey("error")) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token Facebook không hợp lệ");
        }

        // Also verify the token belongs to our app
        Map<String, Object> tokenDebug;
        try {
            String appToken = facebookAppId + "|" + facebookAppSecret;
            tokenDebug = restTemplate.getForObject(
                    "https://graph.facebook.com/debug_token?input_token=" + accessToken + "&access_token=" + appToken,
                    Map.class);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực token Facebook");
        }

        if (tokenDebug == null || !tokenDebug.containsKey("data")) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token Facebook không hợp lệ");
        }

        Map<String, Object> data = (Map<String, Object>) tokenDebug.get("data");
        if (data == null || !Boolean.TRUE.equals(data.get("is_valid"))) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token Facebook không hợp lệ");
        }

        String email = userInfo.containsKey("email") ? String.valueOf(userInfo.get("email")) : null;
        String name = userInfo.containsKey("name") ? String.valueOf(userInfo.get("name")) : "User";

        if (email == null || email.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Không lấy được email từ Facebook. Vui lòng cấp quyền email.");
        }

        return findOrCreateUserAndLogin(email, name, "FACEBOOK");
    }

    // --- Shared ---

    private AuthResponse findOrCreateUserAndLogin(String email, String fullName, String provider) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setUsername(email); // Use email as username for OAuth users
            user.setFullName(fullName);
            user.setPassword(UUID.randomUUID().toString()); // Random password (won't be used)
            user.setRole(UserRole.STUDENT);
            userRepository.save(user);
        }

        String accessToken = jwtUtil.generateToken(user.getUsername());
        String refreshToken = createRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken, user.getUsername(), user.getRole());
    }

    private String createRefreshToken(String username) {
        refreshTokenRepository.deleteByUsername(username);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUsername(username);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
