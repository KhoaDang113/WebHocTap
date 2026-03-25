package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.LiveScheduleDTO;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.Enrollment;
import com.example.WebHocTap.entity.LiveSchedule;
import com.example.WebHocTap.entity.User;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.dto.request.CreateLiveScheduleRequest;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.EnrollmentRepository;
import com.example.WebHocTap.repository.LiveScheduleRepository;
import com.example.WebHocTap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveScheduleService {
    private final LiveScheduleRepository liveScheduleRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
    }

    private boolean isInstructor(User user, Course course) {
        String instructor = course.getInstructor();
        if (instructor == null) return false;
        
        return instructor.equalsIgnoreCase(user.getUsername()) || 
               instructor.equalsIgnoreCase(user.getEmail());
    }

    public LiveScheduleDTO createSchedule(CreateLiveScheduleRequest request) {
        User user = getCurrentUser();

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));
        
        if (!isInstructor(user, course)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the instructor can schedule a live session for this course");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Start time must be in the future");
        }

        LiveSchedule schedule = LiveSchedule.builder()
                .courseId(course.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .status("SCHEDULED")
                .teacherId(user.getId())
                .isReminded(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        LiveSchedule saved = liveScheduleRepository.save(schedule);
        return mapToDTO(saved);
    }

    public List<LiveScheduleDTO> getMySchedules() {
        User user = getCurrentUser();
        return liveScheduleRepository.findByTeacherId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LiveScheduleDTO> getSchedulesByCourseId(String courseId) {
        return liveScheduleRepository.findByCourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void cancelSchedule(String id) {
        User user = getCurrentUser();
        LiveSchedule schedule = liveScheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Schedule not found"));
        
        if (!schedule.getTeacherId().equals(user.getId()) && user.getRole() != com.example.WebHocTap.common.UserRole.ADMIN) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the creator or admin can cancel this schedule");
        }

        schedule.setStatus("CANCELLED");
        schedule.setUpdatedAt(LocalDateTime.now());
        liveScheduleRepository.save(schedule);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusMinutes(30);

        List<LiveSchedule> upcomingSchedules = liveScheduleRepository
                .findByStartTimeBetweenAndIsRemindedFalseAndStatus(now, threshold, "SCHEDULED");

        if (!upcomingSchedules.isEmpty()) {
            log.info("Found {} upcoming live schedules to send reminders for.", upcomingSchedules.size());
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        for (LiveSchedule schedule : upcomingSchedules) {
            try {
                Course course = courseRepository.findById(schedule.getCourseId()).orElse(null);
                if (course == null) continue;

                String timeStr = schedule.getStartTime().format(formatter);

                // Send to teacher
                User teacher = userRepository.findById(schedule.getTeacherId()).orElse(null);
                if (teacher != null && teacher.getEmail() != null) {
                    emailService.sendLiveStreamReminderEmail(teacher.getEmail(), schedule.getTitle(), course.getTitle(), course.getId(), timeStr, java.time.Duration.between(now, schedule.getStartTime()).toMinutes());
                }

                // Send to students
                List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
                for (Enrollment enrollment : enrollments) {
                    User student = userRepository.findById(enrollment.getUserId()).orElse(null);
                    if (student != null && student.getEmail() != null) {
                        emailService.sendLiveStreamReminderEmail(student.getEmail(), schedule.getTitle(), course.getTitle(), course.getId(), timeStr, java.time.Duration.between(now, schedule.getStartTime()).toMinutes());
                    }
                }

                schedule.setReminded(true);
                schedule.setUpdatedAt(LocalDateTime.now());
                liveScheduleRepository.save(schedule);
                log.info("Successfully sent reminders for schedule: {}", schedule.getId());

            } catch (Exception e) {
                log.error("Error sending reminder for schedule " + schedule.getId(), e);
            }
        }
    }

    private LiveScheduleDTO mapToDTO(LiveSchedule schedule) {
        LiveScheduleDTO dto = new LiveScheduleDTO();
        dto.setId(schedule.getId());
        dto.setCourseId(schedule.getCourseId());
        dto.setTitle(schedule.getTitle());
        dto.setDescription(schedule.getDescription());
        dto.setStartTime(schedule.getStartTime());
        dto.setStatus(schedule.getStatus());
        dto.setTeacherId(schedule.getTeacherId());
        dto.setReminded(schedule.isReminded());
        return dto;
    }
}
