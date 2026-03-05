package com.example.WebHocTap.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp, String purpose) {
        String subject = "";
        String text = "";

        if ("REGISTER".equals(purpose)) {
            subject = "WebHocTap - Xác nhận đăng ký tài khoản";
            text = "Mã OTP xác nhận đăng ký tài khoản của bạn là: " + otp + "\n\n" +
                    "Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.";
        } else if ("LOGIN".equals(purpose)) {
            subject = "WebHocTap - Mã đăng nhập";
            text = "Mã OTP đăng nhập của bạn là: " + otp + "\n\n" +
                    "Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.";
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            javaMailSender.send(message);
            log.info("Đã gửi email OTP cho email: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email OTP: ", e);
            // In a real scenario, you might want to throw an exception here
            // Throwing simple RuntimeException for now
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại sau.");
        }
    }
}
