package com.example.WebHocTap.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnswerRequest {
    private String content;
    private Boolean isCorrect;
}
