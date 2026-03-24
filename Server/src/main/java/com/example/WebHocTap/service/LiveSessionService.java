package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.LiveSessionDTO;
import com.example.WebHocTap.dto.LiveSessionJoinResponse;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.LiveSession;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.CreateLiveSessionRequest;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.EnrollmentRepository;
import com.example.WebHocTap.repository.LiveSessionRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LiveSessionService {

    private final LiveSessionRepository liveSessionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final LiveKitService liveKitService;
    private final NotificationService notificationService;

    // Lấy thông tin User hiện tại
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
    }

    // Helper kiểm tra xem user có phải là giảng viên của khóa học không
    private boolean isInstructor(User user, Course course) {
        String instructor = course.getInstructor();
        if (instructor == null) return false;
        
        return instructor.equalsIgnoreCase(user.getUsername()) || 
               instructor.equalsIgnoreCase(user.getEmail()) ||
               instructor.equals(user.getId());
    }

    // Giảng viên tạo phòng
    public LiveSessionDTO createSession(CreateLiveSessionRequest request) {
        User user = getCurrentUser();

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));
        
        if (!isInstructor(user, course)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the instructor can create a live session for this course");
        }

        LiveSession session = new LiveSession();
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setCourseId(course.getId());
        session.setRoomName("course_" + course.getId() + "_room_" + UUID.randomUUID().toString().substring(0, 8));
        session.setStatus("ACTIVE");
        session.setCreatedAt(LocalDateTime.now().toString());

        LiveSession savedSession = liveSessionRepository.save(session);
        
        // Notify clients about the new live session
        notificationService.notifyLiveSessionUpdate(course.getId());
        System.out.println("Đã bắn tin nhắn đến phòng: " + course.getId());
        
        return mapToDTO(savedSession);
    }

    // Tham gia phòng
    public LiveSessionJoinResponse joinSession(String sessionId) {
        User user = getCurrentUser();

        LiveSession session = liveSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Live session not found"));

        if (!session.getStatus().equals("ACTIVE")) {
            throw new AppException(ErrorCode.BAD_REQUEST, "This session is no longer active");
        }

        Course course = courseRepository.findById(session.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));

        boolean isTeacher = isInstructor(user, course);
        boolean isAdmin = user.getRole() == com.example.WebHocTap.common.UserRole.ADMIN;
        
        // Nếu không phải teacher hoặc admin thì mới kiểm tra học sinh có trong khóa học không
        if (!isTeacher && !isAdmin && !enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "You are not enrolled in this course");
        }

        // Tạo LiveKit Token (Admin cũng có quyền như Teacher)
        String token = liveKitService.generateToken(session.getRoomName(), user.getId(), user.getFullName(), isTeacher || isAdmin);

        LiveSessionJoinResponse response = new LiveSessionJoinResponse();
        response.setSession(mapToDTO(session));
        response.setToken(token);
        
        return response;
    }

    // Lấy danh sách các buổi live trong khóa học
    public List<LiveSessionDTO> getSessionsByCourseId(String courseId) {
        User user = getCurrentUser();
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));
                
        boolean isTeacher = isInstructor(user, course);
        boolean isAdmin = user.getRole() == com.example.WebHocTap.common.UserRole.ADMIN;

        if (!isTeacher && !isAdmin && !enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You are not enrolled in this course");
        }
        
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        return liveSessionRepository.findAll(sort).stream()
                .filter(s -> s.getCourseId().equals(courseId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Lấy tất cả các buổi live (Cho Admin: tất cả, cho Teacher: các buổi của họ)
    public List<LiveSessionDTO> getAllSessions(String status) {
        User user = getCurrentUser();
        boolean isAdmin = user.getRole() == com.example.WebHocTap.common.UserRole.ADMIN;
        
        List<LiveSession> sessions;
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        if (isAdmin) {
            sessions = liveSessionRepository.findAll(sort);
        } else {
            // Là Teacher, lấy các khóa học họ dạy
            List<Course> myCourses = courseRepository.findAll().stream()
                    .filter(c -> isInstructor(user, c))
                    .collect(Collectors.toList());
            List<String> myCourseIds = myCourses.stream().map(Course::getId).collect(Collectors.toList());
            
            sessions = liveSessionRepository.findAll(sort).stream()
                    .filter(s -> myCourseIds.contains(s.getCourseId()))
                    .collect(Collectors.toList());
        }

        // Lọc theo status nếu có
        if (status != null && !status.isEmpty()) {
            return sessions.stream()
                    .filter(s -> s.getStatus().equalsIgnoreCase(status))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        return sessions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Giảng viên kết thúc phòng
    public void endSession(String sessionId) {
        User user = getCurrentUser();

        LiveSession session = liveSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Live session not found"));

        Course course = courseRepository.findById(session.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));

        if (!isInstructor(user, course)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the instructor can end this live session");
        }

        session.setStatus("ENDED");
        liveSessionRepository.save(session);

        // Xóa phòng trên LiveKit server để kick out tất cả học sinh
        liveKitService.deleteRoom(session.getRoomName());
        
        // Notify clients that the session has ended
        notificationService.notifyLiveSessionUpdate(course.getId());
    }

    private LiveSessionDTO mapToDTO(LiveSession session) {
        LiveSessionDTO dto = new LiveSessionDTO();
        dto.setId(session.getId());
        dto.setTitle(session.getTitle());
        dto.setCourseId(session.getCourseId());
        dto.setDescription(session.getDescription());
        dto.setRoomName(session.getRoomName());
        dto.setStatus(session.getStatus());
        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }
}
