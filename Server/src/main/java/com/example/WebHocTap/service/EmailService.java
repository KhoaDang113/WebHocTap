package com.example.WebHocTap.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

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

    public void sendLiveStreamReminderEmail(String to, String title, String courseName, String courseId, String timeStr, long remindTime) {
        String subject = "🔔 Nhắc nhở: Lớp học Live sắp bắt đầu - " + courseName;
        String courseUrl = frontendUrl + "/course/" + courseId;

        String htmlContent = "<!DOCTYPE html><html>" +
                "<head><meta charset='UTF-8'><style>" +
                ".container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }" +
                ".header { background-color: #4f46e5; color: white; padding: 24px; text-align: center; }" +
                ".content { padding: 32px; line-height: 1.6; color: #334155; }" +
                ".footer { background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }" +
                ".button { display: inline-block; background-color: #4f46e5; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }" +
                ".info-box { background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px; }" +
                "</style></head>" +
                "<body><div class='container'>" +
                "<div class='header'><h1 style='margin:0;'>WebHocTap</h1></div>" +
                "<div class='content'>" +
                "<h2 style='color: #1e293b;'>🔔 Nhắc nhở: Lớp học sắp bắt đầu</h2>" +
                "<p>Xin chào,</p>" +
                "<p>Chúng tôi muốn nhắc bạn rằng buổi livestream <strong>" + title + "</strong> trong khóa học <strong>" + courseName + "</strong> sẽ diễn ra trong vòng <strong>" + remindTime + " phút tới</strong>.</p>" +
                "<div class='info-box'>" +
                "<p style='margin:0;'><strong>Thời gian:</strong> " + timeStr + "</p>" +
                "<p style='margin:0;'><strong>Khóa học:</strong> " + courseName + "</p>" +
                "</div>" +
                "<p>Vui lòng nhấn vào nút bên dưới để truy cập khóa học và chuẩn bị tham gia buổi học:</p>" +
                "<a href='" + courseUrl + "' class='button' style='color: white;'>Tham gia ngay</a>" +
                "<p style='margin-top: 32px;'>Trân trọng,<br><strong>Đội ngũ WebHocTap</strong></p>" +
                "</div>" +
                "<div class='footer'><p>Đây là email tự động, vui lòng không phản hồi email này.<br>&copy; 2024 WebHocTap. All rights reserved.</p></div>" +
                "</div></body></html>";

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "WebHocTap Team");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML

            javaMailSender.send(message);
            log.info("Đã gửi email nhắc nhở Live (HTML) cho email: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email nhắc nhở Live: ", e);
        }
    }
}
