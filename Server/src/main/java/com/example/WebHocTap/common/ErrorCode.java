package com.example.WebHocTap.common;

public enum ErrorCode {
    SUCCESS(0, "Success"),
    UNKNOWN_ERROR(1, "Unknown error"),
    NOT_FOUND(2, "Resource not found"),
    BAD_REQUEST(3, "Bad request"),
    DUPLICATE(4, "Resource already exists"),
    UNAUTHORIZED(5, "Unauthorized"),
    FORBIDDEN(6, "Forbidden"),
    VALIDATION_ERROR(7, "Validation error"),
    INTERNAL_SERVER_ERROR(8, "Internal server error"),
    TOO_MANY_REQUESTS(9, "Too many requests");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
