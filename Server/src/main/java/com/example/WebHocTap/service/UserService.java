package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.common.UserRole;
import com.example.WebHocTap.dto.UserDTO;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.dto.request.ChangePasswordRequest;
import com.example.WebHocTap.dto.request.UpdateProfileRequest;
import com.example.WebHocTap.dto.request.UserModel;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Lấy user hiện tại ───────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
    }

    // ─── Profile ─────────────────────────────────────────────────────────────

    public UserDTO getMyProfile() {
        return toDTO(getCurrentUser());
    }

    public UserDTO updateProfile(UpdateProfileRequest req) {
        User user = getCurrentUser();
        if (req.getFullName() != null)
            user.setFullName(req.getFullName());
        if (req.getAvatarUrl() != null)
            user.setAvatarUrl(req.getAvatarUrl());
        if (req.getBio() != null)
            user.setBio(req.getBio());
        return toDTO(userRepository.save(user));
    }

    public void changePassword(ChangePasswordRequest req) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public void requestTeacherRole() {
        User user = getCurrentUser();
        if (user.getRole() == UserRole.TEACHER || user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tài khoản đã có quyền Giảng viên hoặc cao hơn");
        }
        if (user.isPendingTeacherRequest()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Yêu cầu của bạn đang được xem xét");
        }
        user.setPendingTeacherRequest(true);
        userRepository.save(user);
    }

    // ─── Admin — User list ────────────────────────────────────────────────────

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found with id: " + id));
        return toDTO(user);
    }

    public List<UserDTO> getPendingTeachers() {
        return userRepository.findByPendingTeacherRequestTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Admin — Lock / Unlock ────────────────────────────────────────────────

    public UserDTO lockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
        user.setLocked(true);
        return toDTO(userRepository.save(user));
    }

    public UserDTO unlockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
        user.setLocked(false);
        return toDTO(userRepository.save(user));
    }

    // ─── Admin — Teacher approval ─────────────────────────────────────────────

    public UserDTO approveTeacher(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
        user.setRole(UserRole.TEACHER);
        user.setPendingTeacherRequest(false);
        return toDTO(userRepository.save(user));
    }

    public UserDTO revokeTeacher(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found"));
        if (user.getRole() != UserRole.TEACHER) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Người dùng không phải Giảng viên");
        }
        user.setRole(UserRole.STUDENT);
        user.setPendingTeacherRequest(false);
        return toDTO(userRepository.save(user));
    }

    // ─── CRUD (Admin) ─────────────────────────────────────────────────────────

    public UserDTO createUser(UserModel model) {
        if (userRepository.existsByUsername(model.getUsername())) {
            throw new AppException(ErrorCode.DUPLICATE, "Username already exists");
        }
        if (userRepository.existsByEmail(model.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE, "Email already exists");
        }

        User user = new User();
        user.setUsername(model.getUsername());
        user.setEmail(model.getEmail());
        user.setPassword(passwordEncoder.encode(model.getPassword()));
        user.setFullName(model.getFullName());
        user.setRole(model.getRole());

        return toDTO(userRepository.save(user));
    }

    public UserDTO updateUser(String id, UserModel model) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found with id: " + id));

        user.setEmail(model.getEmail());
        user.setFullName(model.getFullName());
        user.setRole(model.getRole());

        return toDTO(userRepository.save(user));
    }

    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "User not found with id: " + id));
        user.setDeleted(true);
        userRepository.save(user);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setLocked(user.isLocked());
        dto.setDeleted(user.isDeleted());
        dto.setPendingTeacherRequest(user.isPendingTeacherRequest());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
