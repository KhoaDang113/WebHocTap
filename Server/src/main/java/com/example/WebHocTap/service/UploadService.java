package com.example.WebHocTap.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
    private static final String[] ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"};

    public String uploadImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_TYPES);
        
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getInputStream(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "folder", "webhoctap/courses"
                    ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload image: " + e.getMessage());
        }
    }

    public String uploadVideo(MultipartFile file) {
        validateFile(file, ALLOWED_VIDEO_TYPES);
        
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getInputStream(),
                    ObjectUtils.asMap(
                            "resource_type", "video",
                            "folder", "webhoctap/videos"
                    ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload video: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file, String[] allowedTypes) {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.BAD_REQUEST, "File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        boolean isAllowed = false;
        for (String allowedType : allowedTypes) {
            if (allowedType.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new AppException(ErrorCode.BAD_REQUEST, "File type not allowed");
        }
    }
}
