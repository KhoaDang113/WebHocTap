package com.example.WebHocTap.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String userId;
    private String lessonId;
    private String content;
    private String parentId; // null nếu là comment gốc, có giá trị nếu là reply
    
    @Builder.Default
    private List<String> likes = new ArrayList<>(); // danh sách userId đã like

    @CreatedDate
    private LocalDateTime createdAt;
}
