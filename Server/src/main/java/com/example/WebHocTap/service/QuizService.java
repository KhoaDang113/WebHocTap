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
import com.example.WebHocTap.repository.QuestionRepository;
import com.example.WebHocTap.repository.QuizAttemptRepository;
import com.example.WebHocTap.repository.QuizRepository;
import com.example.WebHocTap.service.EnrollmentService;
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

    public QuizDTO createQuiz(CreateQuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setCourseId(request.getCourseId());
        quiz.setTitle(request.getTitle());
        quiz.setTimeLimit(request.getTimeLimit());
        
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

        // Nếu đã có attempt -> không tạo mới, chỉ tính lại remainingTime
        String userId = enrollmentService.getCurrentUserId();
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId).orElse(null);

        LocalDateTime now = LocalDateTime.now();

        if (attempt == null) {
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

        return new QuizTimerResponse(remaining);
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
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz attempt not found"));

        LocalDateTime now = LocalDateTime.now();
        long remaining = java.time.Duration.between(now, attempt.getEndTime()).getSeconds();
        if (remaining < 0) {
            remaining = 0;
        }

        return new QuizTimerResponse(remaining);
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
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Quiz attempt not found"));

        // ❗ đã submit chưa
        if (Boolean.TRUE.equals(attempt.getSubmitted())) {
            throw new AppException(ErrorCode.DUPLICATE, "Quiz already submitted");
        }

        // ❗ hết giờ chưa
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(attempt.getEndTime())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Time expired");
        }

        // Tính điểm: với mỗi question lấy answer đúng, so với answerId mà user gửi
        List<Question> questions = questionRepository.findByQuizId(quizId);
        int total = questions.size();
        int correct = 0;

        if (request != null && request.getAnswers() != null) {
            for (Question question : questions) {
                String selectedAnswerId = request.getAnswers().get(question.getId());
                if (selectedAnswerId == null) {
                    continue;
                }
                // tìm answer đúng cho câu hỏi
                List<Answer> answers = answerRepository.findByQuestionId(question.getId());
                answers.stream()
                        .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                        .findFirst()
                        .ifPresent(correctAnswer -> {
                            if (correctAnswer.getId().equals(selectedAnswerId)) {
                                // tăng biến correct bên ngoài (dùng array 1 phần tử)
                            }
                        });
            }
        }

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
        quizAttemptRepository.save(attempt);

        return new QuizResultResponse(correct, total);
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
