package com.example.WebHocTap.entity;

import com.example.WebHocTap.common.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "enrollments")
@CompoundIndex(name = "uq_user_course", def = "{'userId': 1, 'courseId': 1}", unique = true)
public class Enrollment {

    @Id
    private String id;

    private String userId;

    private String courseId;

    @CreatedDate
    private LocalDateTime enrolledAt;

    private EnrollmentStatus status;
}

