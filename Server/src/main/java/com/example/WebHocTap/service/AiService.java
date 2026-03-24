package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.CreateQuestionRequest;
import com.example.WebHocTap.model.AiQuizGenerateRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    public List<CreateQuestionRequest> generateQuestions(AiQuizGenerateRequest request) {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Chưa cấu hình API Key cho chức năng AI (Groq)");
        }

        String prompt = "You are an expert educator. Create a multiple-choice quiz about the following topic in Vietnamese: " + request.getTopic() + ".\n" +
                "Generate exactly " + request.getNumQuestions() + " questions.\n" +
                "Each question should have 4 options, and exactly one of them should be remarkably correct.\n" +
                "Return ONLY a strictly valid JSON array without any markdown formatting, no markdown block syntax.\n" +
                "The JSON array must be formatted EXACTLY like this array of objects format:\n" +
                "[\n" +
                "  {\n" +
                "    \"content\": \"Câu hỏi sẽ ở đây?\",\n" +
                "    \"answers\": [\n" +
                "      { \"content\": \"Lựa chọn A\", \"isCorrect\": true },\n" +
                "      { \"content\": \"Lựa chọn B\", \"isCorrect\": false },\n" +
                "      { \"content\": \"Lựa chọn C\", \"isCorrect\": false },\n" +
                "      { \"content\": \"Lựa chọn D\", \"isCorrect\": false }\n" +
                "    ]\n" +
                "  }\n" +
                "]";

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 1.0,
                "max_tokens", 8192,
                "top_p", 1.0
        );

        try {
            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri(groqApiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || !response.containsKey("choices")) {
                throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Dữ liệu trả về từ AI không đúng định dạng");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String rawJson = (String) message.get("content");

            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.substring(7);
            }
            if (rawJson.startsWith("```")) {
                rawJson = rawJson.substring(3);
            }
            if (rawJson.endsWith("```")) {
                rawJson = rawJson.substring(0, rawJson.length() - 3);
            }
            rawJson = rawJson.trim();

            return objectMapper.readValue(rawJson, new TypeReference<List<CreateQuestionRequest>>() {});

        } catch (Exception e) {
            System.err.println("AI Generation Error: " + e.getMessage());
            e.printStackTrace();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi gọi AI sinh câu hỏi: " + e.getMessage(), e);
        }
    }
}
