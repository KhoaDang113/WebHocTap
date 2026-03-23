package com.example.WebHocTap.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.livekit.server.RoomServiceClient;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class LiveKitService {

    @Value("${LIVEKIT_API_KEY}")
    private String apiKey;

    @Value("${LIVEKIT_API_SECRET}")
    private String apiSecret;

    @Value("${LIVEKIT_URL}")
    private String livekitUrl;
    
    private RoomServiceClient roomServiceClient;

    @PostConstruct
    public void init() {
        this.roomServiceClient = RoomServiceClient.createClient(livekitUrl, apiKey, apiSecret);
    }

    // Generate token for a participant to join a room
    public String generateToken(String roomName, String participantIdentity, String participantName, boolean isTeacher) {
        SecretKey secretKey = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));

        // Define LiveKit Video Grants
        Map<String, Object> videoGrants = new HashMap<>();
        videoGrants.put("room", roomName);
        videoGrants.put("roomJoin", true);
        
        if (isTeacher) {
            videoGrants.put("roomCreate", true);
            videoGrants.put("roomAdmin", true);
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("video", videoGrants);
        claims.put("name", participantName);

        // Token valid for 4 hours
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 4 * 3600 * 1000);

        return Jwts.builder()
                .issuer(apiKey)
                .subject(participantIdentity)
                .claims(claims)
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .notBefore(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    // Xóa phòng trên LiveKit server (kick out all participants)
    public void deleteRoom(String roomName) {
        try {
            roomServiceClient.deleteRoom(roomName).execute();
        } catch (Exception e) {
            // Log error but don't fail the session end
            System.err.println("Failed to delete LiveKit room: " + e.getMessage());
        }
    }
}
