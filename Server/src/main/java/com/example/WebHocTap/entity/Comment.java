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
    private String lessonId; // null nếu bình luận ở trang khóa học
    private String courseId; // Bắt buộc
    private String content;
    private String parentId; // null nếu là comment gốc, có giá trị nếu là reply
    
    @Builder.Default
    private List<String> likes = new ArrayList<>(); // danh sách userId đã like

    @CreatedDate
    private LocalDateTime createdAt;

    @Builder.Default
    private boolean hidden = false;

    @Builder.Default
    private boolean pinned = false;

    private String userRole; // ADMIN, INSTRUCTOR, STUDENT, GUEST
}
