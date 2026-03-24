package com.example.WebHocTap.service;

import com.example.WebHocTap.dto.CommentDTO;
import com.example.WebHocTap.dto.CommentRequest;
import com.example.WebHocTap.entity.Comment;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.*;
import com.example.WebHocTap.common.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CommentDTO addComment(String username, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Comment content cannot be empty");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));

        if (request.getCourseId() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Course ID is required");
        }

        com.example.WebHocTap.entity.Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));

        // Determine Role Badge at the time of commenting
        String assignedRole = "GUEST";
        if (user.getRole() == UserRole.ADMIN) {
            assignedRole = "ADMIN";
        } else if (user.getRole() == UserRole.TEACHER) {
            assignedRole = "INSTRUCTOR"; // Tất cả tài khoản giáo viên đều là Giảng viên
        } else if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            assignedRole = "STUDENT";
        }

        Comment comment = Comment.builder()
                .userId(user.getId())
                .courseId(request.getCourseId())
                .lessonId(request.getLessonId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .userRole(assignedRole)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    public List<CommentDTO> getInstructorComments(String instructorUsername) {
        List<com.example.WebHocTap.entity.Course> instructorCourses = courseRepository
                .findByInstructor(instructorUsername);
        List<String> courseIds = instructorCourses.stream()
                .map(com.example.WebHocTap.entity.Course::getId)
                .collect(Collectors.toList());

        return commentRepository.findByCourseIdIn(courseIds)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO toggleHideComment(String username, String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Comment not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));

        com.example.WebHocTap.entity.Course course = courseRepository.findById(comment.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));

        boolean isOwner = course.getInstructor().equals(username);
        if (user.getRole() != UserRole.ADMIN && !isOwner) {
            throw new AppException(ErrorCode.FORBIDDEN, "You don't have permission to manage this comment");
        }

        comment.setHidden(!comment.isHidden());
        return mapToDTO(commentRepository.save(comment));
    }

    public CommentDTO togglePinComment(String username, String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Comment not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));

        com.example.WebHocTap.entity.Course course = courseRepository.findById(comment.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));

        boolean isOwner = course.getInstructor().equals(username);
        if (user.getRole() != UserRole.ADMIN && !isOwner) {
            throw new AppException(ErrorCode.FORBIDDEN, "You don't have permission to pin this comment");
        }

        comment.setPinned(!comment.isPinned());
        return mapToDTO(commentRepository.save(comment));
    }

    public List<CommentDTO> getCommentsByLesson(String lessonId, String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        String currentUserId = currentUser != null ? currentUser.getId() : null;

        List<Comment> rootComments = commentRepository.findByLessonIdAndParentIdIsNullOrderByCreatedAtDesc(lessonId);
        return rootComments.stream()
                .filter(c -> !c.isHidden() || (currentUserId != null && c.getUserId().equals(currentUserId)))
                .map(c -> mapToDTOWithReplies(c, currentUserId))
                .sorted(Comparator.comparing(CommentDTO::isPinned).reversed()
                        .thenComparing(CommentDTO::getCreatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getCommentsByCourse(String courseId, String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        String currentUserId = currentUser != null ? currentUser.getId() : null;

        List<Comment> rootComments = commentRepository
                .findByCourseIdAndLessonIdIsNullAndParentIdIsNullOrderByCreatedAtDesc(courseId);
        return rootComments.stream()
                .filter(c -> !c.isHidden() || (currentUserId != null && c.getUserId().equals(currentUserId)))
                .map(c -> mapToDTOWithReplies(c, currentUserId))
                .sorted(Comparator.comparing(CommentDTO::isPinned).reversed()
                        .thenComparing(CommentDTO::getCreatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    private CommentDTO mapToDTOWithReplies(Comment comment, String currentUserId) {
        CommentDTO dto = mapToDTO(comment);
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        dto.setReplies(replies.stream()
                .filter(r -> !r.isHidden() || (currentUserId != null && r.getUserId().equals(currentUserId)))
                .map(this::mapToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    public CommentDTO toggleLike(String username, String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Comment not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));

        if (comment.getLikes().contains(user.getId())) {
            comment.getLikes().remove(user.getId());
        } else {
            comment.getLikes().add(user.getId());
        }

        return mapToDTO(commentRepository.save(comment));
    }

    private CommentDTO mapToDTO(Comment comment) {
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        com.example.WebHocTap.entity.Lesson lesson = comment.getLessonId() != null
                ? lessonRepository.findById(comment.getLessonId()).orElse(null)
                : null;
        com.example.WebHocTap.entity.Course course = courseRepository.findById(comment.getCourseId()).orElse(null);

        return CommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .lessonId(comment.getLessonId())
                .courseId(comment.getCourseId())
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .likes(comment.getLikes())
                .createdAt(comment.getCreatedAt())
                .userFullName(user != null ? user.getFullName() : "Anonymous")
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .lessonTitle(lesson != null ? lesson.getTitle() : null)
                .courseTitle(course != null ? course.getTitle() : "Unknown Course")
                .hidden(comment.isHidden())
                .pinned(comment.isPinned())
                .userRole(comment.getUserRole())
                .build();
    }
}
