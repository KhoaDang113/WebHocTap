package com.example.WebHocTap.exception;

import com.example.WebHocTap.common.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
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

        HttpStatus status;
        switch (ex.getErrorCode()) {
            case NOT_FOUND:
                status = HttpStatus.NOT_FOUND;
                break;
            case BAD_REQUEST:
            case VALIDATION_ERROR:
                status = HttpStatus.BAD_REQUEST;
                break;
            case DUPLICATE:
                status = HttpStatus.CONFLICT;
                break;
            case UNAUTHORIZED:
                status = HttpStatus.UNAUTHORIZED;
                break;
            case FORBIDDEN:
                status = HttpStatus.FORBIDDEN;
                break;
            default:
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                break;
        }

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("code", ErrorCode.UNAUTHORIZED.getCode());
        body.put("message", "Sai tên đăng nhập hoặc mật khẩu");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("code", ErrorCode.FORBIDDEN.getCode());
        body.put("message", "Bạn không có quyền truy cập");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
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
