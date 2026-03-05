package com.example.WebHocTap.exception;

import com.example.WebHocTap.common.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("code", ex.getErrorCode().getCode());
        body.put("message", ex.getMessage());

        HttpStatus status = switch (ex.getErrorCode()) {
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case BAD_REQUEST, VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            case DUPLICATE -> HttpStatus.CONFLICT;
            case UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case FORBIDDEN -> HttpStatus.FORBIDDEN;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("code", ErrorCode.UNKNOWN_ERROR.getCode());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
