package com.example.WebHocTap.service;

import com.example.WebHocTap.dto.CourseDTO;
import com.example.WebHocTap.dto.FavoriteDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.Favorite;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.FavoriteRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
    }

    public FavoriteDTO toggleFavorite(String username, String courseId) {
        User user = getUserByUsername(username);
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndCourseId(user.getId(), courseId);
        
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return null;
        } else {
            Favorite favorite = Favorite.builder()
                    .userId(user.getId())
                    .courseId(courseId)
                    .build();
            Favorite saved = favoriteRepository.save(favorite);
            return FavoriteDTO.builder()
                    .id(saved.getId())
                    .userId(saved.getUserId())
                    .courseId(saved.getCourseId())
                    .createdAt(saved.getCreatedAt())
                    .build();
        }
    }

    public boolean checkFavorite(String username, String courseId) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        return favoriteRepository.findByUserIdAndCourseId(userOpt.get().getId(), courseId).isPresent();
    }

    public List<CourseDTO> getFavoriteCourses(String username) {
        User user = getUserByUsername(username);
        List<Favorite> favorites = favoriteRepository.findByUserId(user.getId());
        List<String> courseIds = favorites.stream()
                .map(Favorite::getCourseId)
                .collect(Collectors.toList());
        
        List<Course> courses = courseRepository.findAllById(courseIds);
        
        return courses.stream().map(course -> CourseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .price(course.getPrice())
                .categoryId(course.getCategoryId())
                .instructor(course.getInstructor())
                .status(course.getStatus())
                .isPrivate(course.isPrivate())
                .inviteCode(course.getInviteCode())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build()).collect(Collectors.toList());
    }
}
