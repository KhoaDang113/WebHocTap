package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.UserDTO;
import com.example.WebHocTap.model.UserModel;
import com.example.WebHocTap.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    // ─── Danh sách user ───────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/pending-teachers")
    public ResponseEntity<List<UserDTO>> getPendingTeachers() {
        return ResponseEntity.ok(userService.getPendingTeachers());
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserModel model) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody UserModel model) {
        return ResponseEntity.ok(userService.updateUser(id, model));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Khóa / Mở tài khoản ─────────────────────────────────────────────────

    @PutMapping("/{id}/lock")
    public ResponseEntity<UserDTO> lockUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.lockUser(id));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<UserDTO> unlockUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.unlockUser(id));
    }

    // ─── Phê duyệt Giảng viên ────────────────────────────────────────────────

    @PutMapping("/{id}/approve-teacher")
    public ResponseEntity<UserDTO> approveTeacher(@PathVariable String id) {
        return ResponseEntity.ok(userService.approveTeacher(id));
    }

    @PutMapping("/{id}/revoke-teacher")
    public ResponseEntity<UserDTO> revokeTeacher(@PathVariable String id) {
        return ResponseEntity.ok(userService.revokeTeacher(id));
    }
}
