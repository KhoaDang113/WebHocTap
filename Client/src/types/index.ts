// Common API response type
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

// Auth types
export interface User {
  id: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface AuthResponse {
  id: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface OtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// User management
export interface UserDTO {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isLocked: boolean;
  pendingTeacherRequest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: "TEACHER" | "STUDENT";
}

// Course management
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  categoryId: string;
  instructor?: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  inviteCode?: string;
  isPrivate?: boolean;
  progressPercent?: number; // Add this line
}

export interface CourseProgressDTO {
  completedLessonIds: string[];
  progressPercent: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoursePayload {
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  categoryId: string;
  instructor?: string;
  status: CourseStatus;
  isPrivate?: boolean;
}

// Lesson management
export interface LessonDTO {
  id: string;
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPayload {
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  videoUrl?: string;
  imageUrl?: string;
}

// Quiz management
export interface AnswerDTO {
  id: string;
  content: string;
  isCorrect?: boolean;
}

export interface QuestionDTO {
  id: string;
  content: string;
  answers: AnswerDTO[];
  isMultipleChoice?: boolean;
}

export interface QuizDTO {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  timeLimit: number;
  status: "DRAFT" | "PUBLIC" | "PRIVATE";
  maxAttempts?: number;
  questions?: QuestionDTO[];
}

export interface QuizAttemptDTO {
  id: string;
  quizId: string;
  remainingTime: number;
  status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "MAX_ATTEMPTS_REACHED" | "NOT_STARTED";
  score?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  maxAttempts?: number;
  attemptCount?: number;
}

export interface QuizAttemptHistoryResponse {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  startTime: string;
  endTime: string;
  submitted: boolean;
  correctAnswers?: number;
  totalQuestions?: number;
  score?: number;
}

export interface SubmitQuizResponse {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

// Interactions (Favorite, Review, Comment)
export interface FavoriteDTO {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  userFullName?: string;
  userAvatar?: string;
  courseTitle?: string;
  isHidden?: boolean;
}

export interface CommentDTO {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  parentId: string | null;
  likes: string[];
  createdAt: string;
  userFullName?: string;
  userAvatar?: string;
  replies?: CommentDTO[];
  lessonTitle?: string;
  courseTitle?: string;
  isHidden?: boolean;
  isPinned?: boolean;
  userRole?: string;
}

// Instructor Stats
export interface InstructorStatsDTO {
  totalCourses: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
}

export interface InstructorStudentDTO {
  userId: string;
  fullName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progressPercent: number;
}
// Live Session management
export interface LiveSessionDTO {
  id: string;
  title: string;
  courseId: string;
  description: string;
  roomName: string;
  status: string;
  createdAt: string;
}

export interface CreateLiveSessionRequest {
  title: string;
  description: string;
  courseId: string;
}

// Live Schedule management
export interface LiveScheduleDTO {
  id: string;
  courseId: string;
  title: string;
  description: string;
  startTime: string; // ISO String
  status: "SCHEDULED" | "DONE" | "CANCELLED";
  teacherId: string;
  isReminded: boolean;
}

export interface CreateLiveScheduleRequest {
  courseId: string;
  title: string;
  description: string;
  startTime: string;
}
