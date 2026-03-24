package com.example.WebHocTap.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otp_sessions")
public class OtpSession {

    @Id
    private String id;

    @Indexed
    private String email;

    private String otpCode;

    private LocalDateTime expiryTime;

    private String purpose; // "REGISTER" or "LOGIN"

    private boolean isUsed;

    // Store registration data temporarily as JSON string (omitted for LOGIN)
    private String sessionData;
}
