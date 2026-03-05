package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.UserDTO;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.UserModel;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        user.setPassword(model.getPassword());
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
        if (!userRepository.existsById(id)) {
            throw new AppException(ErrorCode.NOT_FOUND, "User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
