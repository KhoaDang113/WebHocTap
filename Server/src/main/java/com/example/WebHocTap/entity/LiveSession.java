package com.example.WebHocTap.entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "live_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveSession {
    @Id
    private String id;
    private String title;
    private String courseId;
    private String description;
    private String roomName;
    private String apiKey;
    private String apiSecret;
    private String accessToken;
    private String joinUrl;
    private String hostUrl;
    private String recordingUrl;
    private String status;
    private String type;
    @CreatedDate
    private String createdAt;
    private String updatedAt;
}
