package com.example.WebHocTap.controller;

import com.example.WebHocTap.dto.ApiResponse;
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

    // ??? Danh sách user ???????????????????????????????????????????????????????????????????
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @GetMapping("/pending-teachers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getPendingTeachers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPendingTeachers()));
    }

    // ??? CRUD ?????????????????????????????????????????????????????????????????????????????
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody UserModel model) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(userService.createUser(model), "User created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable("id") String id, @RequestBody UserModel model) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateUser(id, model), "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User deleted successfully"));
    }

    // ??? Khóa / M? tài kho?n ??????????????????????????????????????????????????????????????
    @PutMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<UserDTO>> lockUser(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.lockUser(id), "User locked successfully"));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<UserDTO>> unlockUser(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.unlockUser(id), "User unlocked successfully"));
    }

    // ??? Phê duy?t Gi?ng viên ?????????????????????????????????????????????????????????????
    @PutMapping("/{id}/approve-teacher")
    public ResponseEntity<ApiResponse<UserDTO>> approveTeacher(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.approveTeacher(id), "Teacher approved successfully"));
    }

    @PutMapping("/{id}/revoke-teacher")
    public ResponseEntity<ApiResponse<UserDTO>> revokeTeacher(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.revokeTeacher(id), "Teacher role revoked"));
    }
}
