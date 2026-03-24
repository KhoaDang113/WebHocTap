package com.example.WebHocTap.service;

import com.example.WebHocTap.common.ErrorCode;
import com.example.WebHocTap.dto.AnswerDTO;
import com.example.WebHocTap.dto.QuestionDTO;
import com.example.WebHocTap.dto.QuizDTO;
import com.example.WebHocTap.entity.Answer;
import com.example.WebHocTap.entity.Question;
import com.example.WebHocTap.entity.Quiz;
import com.example.WebHocTap.entity.QuizAttempt;
import com.example.WebHocTap.exception.AppException;
import com.example.WebHocTap.model.QuizResultResponse;
import com.example.WebHocTap.model.QuizSubmitRequest;
import com.example.WebHocTap.model.QuizTimerResponse;
import com.example.WebHocTap.model.CreateAnswerRequest;
import com.example.WebHocTap.model.CreateQuestionRequest;
import com.example.WebHocTap.model.CreateQuizRequest;
import com.example.WebHocTap.repository.AnswerRepository;
import com.example.WebHocTap.repository.CourseRepository;
import com.example.WebHocTap.repository.QuestionRepository;
import com.example.WebHocTap.repository.QuizAttemptRepository;
import com.example.WebHocTap.repository.QuizRepository;
import com.example.WebHocTap.repository.UserRepository;
import com.example.WebHocTap.model.QuizAttemptHistoryResponse;
import com.example.WebHocTap.entity.Course;
import com.example.WebHocTap.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public QuizDTO createQuiz(CreateQuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setCourseId(request.getCourseId());
        quiz.setTitle(request.getTitle());
        quiz.setTimeLimit(request.getTimeLimit() != null && request.getTimeLimit() > 0 ? request.getTimeLimit() : 600);
        quiz.setMaxAttempts(request.getMaxAttempts() != null && request.getMaxAttempts() > 0 ? request.getMaxAttempts() : 1);
        quiz.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        
        Quiz savedQuiz = quizRepository.save(quiz);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (CreateQuestionRequest questionReq : request.getQuestions()) {
                createQuestion(savedQuiz.getId(), questionReq);
            }
        }

        return getQuizById(savedQuiz.getId());
    }

    public QuizDTO getQuizById(String id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + id));
        
        return toDTO(quiz);
    }

    public List<QuizDTO> getQuizzesByCourse(String courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<QuizDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public QuizDTO updateQuiz(String id, CreateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + id));
        
        quiz.setCourseId(request.getCourseId());
        quiz.setTitle(request.getTitle());
        quiz.setTimeLimit(request.getTimeLimit() != null && request.getTimeLimit() > 0 ? request.getTimeLimit() : 600);
        quiz.setMaxAttempts(request.getMaxAttempts() != null && request.getMaxAttempts() > 0 ? request.getMaxAttempts() : 1);
        quiz.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        
        Quiz updatedQuiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            List<Question> oldQuestions = questionRepository.findByQuizId(id);
            for (Question q : oldQuestions) {
                List<Answer> oldAnswers = answerRepository.findByQuestionId(q.getId());
                answerRepository.deleteAll(oldAnswers);
            }
            questionRepository.deleteAll(oldQuestions);

            for (CreateQuestionRequest questionReq : request.getQuestions()) {
                createQuestion(updatedQuiz.getId(), questionReq);
            }
        }

        return getQuizById(updatedQuiz.getId());
    }

    public void deleteQuiz(String id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + id));

        List<Question> oldQuestions = questionRepository.findByQuizId(id);
        for (Question q : oldQuestions) {
            List<Answer> oldAnswers = answerRepository.findByQuestionId(q.getId());
            answerRepository.deleteAll(oldAnswers);
        }
        questionRepository.deleteAll(oldQuestions);

        quizRepository.delete(quiz);
    }

    /**
     * Bắt đầu làm quiz: nếu đã có attempt thì trả lại attempt đó (không reset timer),
     * nếu chưa có thì tạo mới và set startTime/endTime.
     */
    public QuizTimerResponse startQuiz(String quizId) {
        // Lấy quiz + kiểm tra tồn tại
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + quizId));

        // Check enrollment theo courseId trong quiz
        boolean enrolled = enrollmentService.isEnrolled(quiz.getCourseId());
        if (!enrolled) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User is not enrolled in this course");
        }

        // Kiểm tra xem có lần làm bài nào đang dang dở (chưa nộp) không
        String userId = enrollmentService.getCurrentUserId();
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserIdAndSubmittedFalse(quizId, userId).orElse(null);

        List<QuizAttempt> allAttempts = quizAttemptRepository.findAllByQuizIdAndUserId(quizId, userId);
        int submittedCount = (int) allAttempts.stream().filter(QuizAttempt::isSubmitted).count();
        int maxAttempts = quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1;

        LocalDateTime now = LocalDateTime.now();

        if (attempt == null) {
            // Nếu không có bài đang làm, kiểm tra giới hạn số lần làm bài
            if (submittedCount >= maxAttempts) {
                // Đã hết lượt làm bài, trả về thông tin bài thi cuối cùng kèm status lỗi
                QuizAttempt lastAttempt = allAttempts.isEmpty() ? null : allAttempts.get(allAttempts.size()-1);
                return new QuizTimerResponse(0L, true, "MAX_ATTEMPTS_REACHED", 
                    lastAttempt != null ? lastAttempt.getScore() : 0.0,
                    lastAttempt != null ? lastAttempt.getCorrectAnswers() : 0,
                    lastAttempt != null ? lastAttempt.getTotalQuestions() : 0,
                    maxAttempts, submittedCount);
            }

            LocalDateTime endTime = now.plusSeconds(quiz.getTimeLimit() != null ? quiz.getTimeLimit() : 0);

            attempt = new QuizAttempt();
            attempt.setQuizId(quizId);
            attempt.setUserId(userId);
            attempt.setStartTime(now);
            attempt.setEndTime(endTime);
            attempt.setSubmitted(false);

            quizAttemptRepository.save(attempt);
        }

        long remaining = java.time.Duration.between(now, attempt.getEndTime()).getSeconds();
        if (remaining < 0) {
            remaining = 0;
        }

        String status = "IN_PROGRESS";
        if (remaining <= 0) {
            status = "EXPIRED";
            remaining = 0;
        }

        return new QuizTimerResponse(remaining, false, status, attempt.getScore(),
            attempt.getCorrectAnswers(), attempt.getTotalQuestions(), maxAttempts, submittedCount);
    }

    /**
     * Lấy remainingTime hiện tại cho attempt.
     */
    public QuizTimerResponse getAttempt(String quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + quizId));

        boolean enrolled = enrollmentService.isEnrolled(quiz.getCourseId());
        if (!enrolled) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User is not enrolled in this course");
        }

        String userId = enrollmentService.getCurrentUserId();
        
        // Ưu tiên tìm attempt chưa nộp
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserIdAndSubmittedFalse(quizId, userId).orElse(null);
        
        List<QuizAttempt> allAttempts = quizAttemptRepository.findAllByQuizIdAndUserId(quizId, userId);
        int submittedCount = (int) allAttempts.stream().filter(QuizAttempt::isSubmitted).count();
        int maxAttempts = quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1;

        if (attempt == null) {
            // Nếu không có bài đang làm, trả về thông tin của lượt làm bài cuối cùng
            QuizAttempt lastAttempt = allAttempts.isEmpty() ? null : allAttempts.get(allAttempts.size()-1);
            String status = (submittedCount >= maxAttempts) ? "MAX_ATTEMPTS_REACHED" : "NOT_STARTED";
            
            return new QuizTimerResponse(0L, lastAttempt != null && lastAttempt.isSubmitted(), status,
                lastAttempt != null ? lastAttempt.getScore() : 0.0,
                lastAttempt != null ? lastAttempt.getCorrectAnswers() : 0,
                lastAttempt != null ? lastAttempt.getTotalQuestions() : 0,
                maxAttempts, submittedCount);
        }

        LocalDateTime now = LocalDateTime.now();
        long remaining = java.time.Duration.between(now, attempt.getEndTime()).getSeconds();
        if (remaining < 0) {
            remaining = 0;
        }

        String status = "IN_PROGRESS";
        if (remaining <= 0) {
            status = "EXPIRED";
            remaining = 0;
        }

        return new QuizTimerResponse(remaining, false, status, attempt.getScore(),
            attempt.getCorrectAnswers(), attempt.getTotalQuestions(), maxAttempts, submittedCount);
    }

    /**
     * Nộp bài: kiểm tra đã submit chưa và còn thời gian không, sau đó chấm điểm.
     */
    public QuizResultResponse submitQuiz(String quizId, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz not found with id: " + quizId));

        boolean enrolled = enrollmentService.isEnrolled(quiz.getCourseId());
        if (!enrolled) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User is not enrolled in this course");
        }

        String userId = enrollmentService.getCurrentUserId();
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserIdAndSubmittedFalse(quizId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "No active quiz attempt found"));

        // ❗ đã submit chưa
        if (attempt.isSubmitted()) {
            throw new AppException(ErrorCode.DUPLICATE, "Quiz already submitted");
        }

        // Cho phép nộp bài kể cả khi vừa hết giờ (auto-submit)
        LocalDateTime now = LocalDateTime.now();
        if (attempt.getEndTime() == null || now.isAfter(attempt.getEndTime())) {
            // Có thể log lại việc nộp trễ nếu cần
        }

        // Tính điểm: với mỗi question lấy answer đúng, so với answerId mà user gửi
        List<Question> questions = questionRepository.findByQuizId(quizId);
        int total = questions.size();
        int correct = 0;

        // ❗ Đã xóa đoạn lặp trùng lặp ở đây. Chuyển thẳng xuống tính điểm an toàn phía dưới.

        // cách an toàn: tính trong vòng lặp với biến tạm
        correct = 0;
        if (request != null && request.getAnswers() != null) {
            for (Question question : questions) {
                String selectedAnswerId = request.getAnswers().get(question.getId());
                if (selectedAnswerId == null) {
                    continue;
                }
                List<Answer> answers = answerRepository.findByQuestionId(question.getId());
                for (Answer answer : answers) {
                    if (Boolean.TRUE.equals(answer.getIsCorrect())
                            && answer.getId().equals(selectedAnswerId)) {
                        correct++;
                        break;
                    }
                }
            }
        }

        attempt.setSubmitted(true);
        attempt.setCorrectAnswers(correct);
        attempt.setTotalQuestions(total);
        double score = (total > 0) ? ((double) correct / total) * 10.0 : 0.0;
        attempt.setScore(score);
        quizAttemptRepository.save(attempt);

        boolean passed = (score >= 5.0); // logic for passed (thang điểm 10)

        return new QuizResultResponse(score, passed, correct, total);
    }

    public Double getMyAverageScore() {
        String userId = enrollmentService.getCurrentUserId();
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndSubmittedTrue(userId);
        if (attempts.isEmpty()) {
            return 0.0;
        }
        double totalScore = 0.0;
        for (QuizAttempt attempt : attempts) {
            totalScore += attempt.getScore() != null ? attempt.getScore() : 0.0;
        }
        return totalScore / attempts.size();
    }

    private void createQuestion(String quizId, CreateQuestionRequest request) {
        Question question = new Question();
        question.setQuizId(quizId);
        question.setContent(request.getContent());
        
        Question savedQuestion = questionRepository.save(question);

        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            for (CreateAnswerRequest answerReq : request.getAnswers()) {
                createAnswer(savedQuestion.getId(), answerReq);
            }
        }
    }

    private void createAnswer(String questionId, CreateAnswerRequest request) {
        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setContent(request.getContent());
        answer.setIsCorrect(request.getIsCorrect() != null ? request.getIsCorrect() : false);
        
        answerRepository.save(answer);
    }

    private QuizDTO toDTO(Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setCourseId(quiz.getCourseId());
        dto.setTitle(quiz.getTitle());
        dto.setTimeLimit(quiz.getTimeLimit());
        dto.setMaxAttempts(quiz.getMaxAttempts());
        dto.setStatus(quiz.getStatus());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setUpdatedAt(quiz.getUpdatedAt());

        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        dto.setQuestions(questions.stream()
                .map(q -> toQuestionDTO(q))
                .collect(Collectors.toList()));

        return dto;
    }

    private QuestionDTO toQuestionDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuizId(question.getQuizId());
        dto.setContent(question.getContent());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());

        List<Answer> answers = answerRepository.findByQuestionId(question.getId());
        dto.setAnswers(answers.stream()
                .map(this::toAnswerDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Lấy toàn bộ lịch sử làm bài (dành cho Admin)
     */
    public List<QuizAttemptHistoryResponse> getAllAttemptsForAdmin() {
        return quizAttemptRepository.findAll().stream()
                .map(attempt -> {
                    Quiz quiz = quizRepository.findById(attempt.getQuizId()).orElse(null);
                    User user = userRepository.findById(attempt.getUserId()).orElse(null);
                    Course course = quiz != null ? courseRepository.findById(quiz.getCourseId()).orElse(null) : null;

                    return QuizAttemptHistoryResponse.builder()
                            .id(attempt.getId())
                            .userId(attempt.getUserId())
                            .fullName(user != null ? user.getFullName() : "Unknown")
                            .username(user != null ? user.getUsername() : "Unknown")
                            .quizId(attempt.getQuizId())
                            .quizTitle(quiz != null ? quiz.getTitle() : "Xoá/Không tồn tại")
                            .courseTitle(course != null ? course.getTitle() : "Xoá/Không tồn tại")
                            .startTime(attempt.getStartTime())
                            .endTime(attempt.getEndTime())
                            .submitted(attempt.isSubmitted())
                            .correctAnswers(attempt.getCorrectAnswers())
                            .totalQuestions(attempt.getTotalQuestions())
                            .score(attempt.getScore())
                            .build();
                })
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime())) // Mới nhất trên đầu
                .collect(Collectors.toList());
    }

    /**
     * Xóa 1 lần làm bài
     */
    public void deleteAttempt(String id) {
        quizAttemptRepository.deleteById(id);
    }

    private AnswerDTO toAnswerDTO(Answer answer) {
        AnswerDTO dto = new AnswerDTO();
        dto.setId(answer.getId());
        dto.setQuestionId(answer.getQuestionId());
        dto.setContent(answer.getContent());
        dto.setIsCorrect(answer.getIsCorrect());
        dto.setCreatedAt(answer.getCreatedAt());
        dto.setUpdatedAt(answer.getUpdatedAt());
        return dto;
    }
}
