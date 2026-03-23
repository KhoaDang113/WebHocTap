package com.example.WebHocTap.service;

import com.example.WebHocTap.dto.CommentDTO;
import com.example.WebHocTap.dto.CommentRequest;
import com.example.WebHocTap.entity.Comment;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.repository.CommentRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentDTO addComment(String username, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Comment content cannot be empty");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));

        Comment comment = Comment.builder()
                .userId(user.getId()) // Store ID
                .lessonId(request.getLessonId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .build();
        
        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    public List<CommentDTO> getCommentsByLesson(String lessonId) {
        List<Comment> rootComments = commentRepository.findByLessonIdAndParentIdIsNullOrderByCreatedAtDesc(lessonId);
        return rootComments.stream().map(this::mapToDTOWithReplies).collect(Collectors.toList());
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

    private CommentDTO mapToDTOWithReplies(Comment comment) {
        CommentDTO dto = mapToDTO(comment);
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        dto.setReplies(replies.stream().map(this::mapToDTO).collect(Collectors.toList()));
        return dto;
    }

    private CommentDTO mapToDTO(Comment comment) {
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        return CommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .lessonId(comment.getLessonId())
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .likes(comment.getLikes())
                .createdAt(comment.getCreatedAt())
                .userFullName(user != null ? user.getFullName() : "Anonymous")
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .build();
    }
}
