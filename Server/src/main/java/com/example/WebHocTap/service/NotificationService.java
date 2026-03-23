package com.example.WebHocTap.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyLiveSessionUpdate(String courseId) {
        // Broadcast a simple generic message indicating a change in live sessions for this course
        messagingTemplate.convertAndSend("/topic/course/" + courseId + "/live-sessions", "UPDATE");
    }
}
