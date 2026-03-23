package com.example.WebHocTap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveSessionJoinResponse {
    private LiveSessionDTO session;
    private String token;
}
