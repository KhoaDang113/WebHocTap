package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.AuthResponse;
import com.example.WebHocTap.entity.RefreshToken;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.LoginRequest;
import com.example.WebHocTap.model.RegisterRequest;
import com.example.WebHocTap.model.VerifyOtpRequest;
import com.example.WebHocTap.repository.RefreshTokenRepository;
import com.example.WebHocTap.repository.UserRepository;
import com.example.WebHocTap.repository.OtpSessionRepository;
import com.example.WebHocTap.entity.OtpSession;
import com.example.WebHocTap.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpSessionRepository otpSessionRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // --- REGISTRATION FLOW ---

    public Map<String, String> requestRegistrationOtp(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.DUPLICATE, "Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE, "Email đã tồn tại");
        }
        System.out.println("Request OTP for: " + request.getEmail());
        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        // Invalidate old pending OTPs for this email and purpose
        otpSessionRepository.findByEmailAndPurposeAndIsUsedFalse(request.getEmail(), "REGISTER")
                .ifPresent(otpSessionRepository::delete);

        try {
            OtpSession session = new OtpSession();
            session.setEmail(request.getEmail());
            session.setOtpCode(otpCode);
            session.setPurpose("REGISTER");
            session.setExpiryTime(LocalDateTime.now().plusMinutes(5));
            session.setUsed(false);
            session.setSessionData(objectMapper.writeValueAsString(request));
            otpSessionRepository.save(session);

            // Send OTP email
            emailService.sendOtpEmail(request.getEmail(), otpCode, "REGISTER");

            return Map.of("message", "Mã OTP đã được gửi đến email của bạn");
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR, "Lỗi khi xử lý thông tin đăng ký");
        }
    }

    public AuthResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        OtpSession session = otpSessionRepository.findByEmailAndPurposeAndIsUsedFalse(request.getEmail(), "REGISTER")
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST,
                        "Không tìm thấy yêu cầu đăng ký hoặc mã đã hết hạn"));

        if (session.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP đã hết hạn");
        }

        if (!session.getOtpCode().equals(request.getOtp())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP không chính xác");
        }

        try {
            RegisterRequest registerRequest = objectMapper.readValue(session.getSessionData(), RegisterRequest.class);

            // Re-check constraints just in case
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                throw new AppException(ErrorCode.DUPLICATE, "Username đã tồn tại");
            }
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                throw new AppException(ErrorCode.DUPLICATE, "Email đã tồn tại");
            }

            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setFullName(registerRequest.getFullName());
            user.setRole(UserRole.STUDENT);

            userRepository.save(user);

            // Delete session after successful use
            otpSessionRepository.delete(session);

            String accessToken = jwtUtil.generateToken(user.getUsername());
            String refreshToken = createRefreshToken(user.getUsername());

            return new AuthResponse(accessToken, refreshToken, user.getUsername(), user.getRole());

        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR, "Lỗi khi tạo tài khoản");
        }
    }

    // --- LOGIN FLOW ---

    public Map<String, String> login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User không tồn tại"));

        // Generate OTP and send to user's email
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        otpSessionRepository.findByEmailAndPurposeAndIsUsedFalse(user.getEmail(), "LOGIN")
                .ifPresent(otpSessionRepository::delete);

        OtpSession session = new OtpSession();
        session.setEmail(user.getEmail());
        session.setOtpCode(otpCode);
        session.setPurpose("LOGIN");
        session.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        session.setUsed(false);
        otpSessionRepository.save(session);

        emailService.sendOtpEmail(user.getEmail(), otpCode, "LOGIN");

        return Map.of("message", "Mã OTP đã được gửi đến email của bạn", "email", user.getEmail());
    }

    public Map<String, String> requestLoginOtp(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Email chưa được đăng ký"));

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        otpSessionRepository.findByEmailAndPurposeAndIsUsedFalse(email, "LOGIN")
                .ifPresent(otpSessionRepository::delete);

        OtpSession session = new OtpSession();
        session.setEmail(email);
        session.setOtpCode(otpCode);
        session.setPurpose("LOGIN");
        session.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        session.setUsed(false);
        otpSessionRepository.save(session);

        // Send OTP email
        emailService.sendOtpEmail(email, otpCode, "LOGIN");

        return Map.of("message", "Mã OTP đã được gửi đến email của bạn");
    }

    public AuthResponse verifyLoginOtp(VerifyOtpRequest request) {
        OtpSession session = otpSessionRepository.findByEmailAndPurposeAndIsUsedFalse(request.getEmail(), "LOGIN")
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn"));

        if (session.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP đã hết hạn");
        }

        if (!session.getOtpCode().equals(request.getOtp())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP không chính xác");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User không tồn tại"));

        // Delete session after successful use
        otpSessionRepository.delete(session);

        String accessToken = jwtUtil.generateToken(user.getUsername());
        String refreshToken = createRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken, user.getUsername(), user.getRole());
    }

    // --- SHARED ---

    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Refresh token không hợp lệ"));

        // Check expiry
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Refresh token đã hết hạn. Vui lòng đăng nhập lại");
        }

        User user = userRepository.findByUsername(refreshToken.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User không tồn tại"));

        // Delete old refresh token and create new one (rotation)
        refreshTokenRepository.delete(refreshToken);
        String newAccessToken = jwtUtil.generateToken(user.getUsername());
        String newRefreshToken = createRefreshToken(user.getUsername());

        return new AuthResponse(newAccessToken, newRefreshToken, user.getUsername(), user.getRole());
    }

    public void logout(String refreshTokenStr) {
        refreshTokenRepository.deleteByToken(refreshTokenStr);
    }

    private String createRefreshToken(String username) {
        // Delete any existing refresh tokens for this user
        refreshTokenRepository.deleteByUsername(username);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUsername(username);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
