package com.example.WebHocTap.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiQuizGenerateRequest {
    private String topic;
    private int numQuestions;
}
