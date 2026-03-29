# 📚 WebHocTap - Nền tảng học tập trực tuyến

Một hệ thống quản lý học tập (LMS) toàn diện với hỗ trợ video conference trực tiếp, quản lý khóa học, bài tập và kiểm tra. Được xây dựng với công nghệ hiện đại để cung cấp trải nghiệm học tập mượt mà và hiệu quả.

## 🎯 Tính năng chính

### 👨‍🎓 Dành cho Học viên

- 📖 Tìm kiếm và đăng ký khóa học từ thư viện phong phú
- 🎬 Xem bài giảng video chất lượng cao với điều khiển toàn diện
- 📝 Làm bài tập và bài kiểm tra trực tuyến
- 🎥 Tham gia phiên học trực tiếp (livestream) với giáo viên
- 💬 Tương tác real-time: đặt câu hỏi, nhận phản hồi
- ⭐ Lưu khóa học yêu thích cho truy cập nhanh
- 📊 Xem tiến độ học tập và kết quả kiểm tra

### 👨‍🏫 Dành cho Giáo viên

- 📊 Dashboard quản lý khóa học, bài giảng toàn diện
- 🎬 Tạo, chỉnh sửa, quản lý bài giảng video
- 📝 Tạo bài kiểm tra với nhiều dạng câu hỏi (trắc nghiệm, tự luận, v.v)
- 🎥 Livestream lớp học với video HD, âm thanh rõ ràng
- 🔊 Quản lý tương tác: mở/tắt mic, camera, phát biểu
- 📈 Thống kê chi tiết: số học viên, tương tác, tiến độ
- 📋 Đánh giá và phản hồi cho từng học viên

### 🛡️ Dành cho Quản trị viên

- 👥 Quản lý người dùng (học viên, giáo viên, quản trị)
- 📚 Quản lý khóa học, bài giảng, bài kiểm tra toàn hệ thống
- 📊 Báo cáo và thống kê tổng hợp
- 🎓 Quản lý danh mục khóa học và phân loại
- 🎥 Giám sát phiên livestream hoạt động
- 🔒 Quản lý quyền truy cập và bảo mật

## 🏗️ Kiến trúc hệ thống

```
WebHocTap/
├── Client/          # Frontend - React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Component tái sử dụng
│   │   ├── pages/           # Trang chính (Home, Login, Courses, etc)
│   │   ├── hooks/           # Custom hooks cho API
│   │   ├── api/             # Gọi API backend
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Hàm utility
│   │   └── App.tsx          # Routing chính
│   └── package.json
│
└── Server/          # Backend - Spring Boot + Java 17
    ├── src/
    │   ├── main/
    │   │   └── java/com/example/WebHocTap/
    │   │       ├── controller/      # API endpoints
    │   │       ├── service/         # Business logic
    │   │       ├── repository/      # Database access
    │   │       ├── model/           # MongoDB models
    │   │       └── config/          # Configuration
    │   └── test/                    # Unit tests
    └── pom.xml
```

## 💻 Tech Stack

### Frontend

| Công nghệ             | Phiên bản | Mục đích                         |
| --------------------- | --------- | -------------------------------- |
| **React**             | 19.2      | UI Framework                     |
| **TypeScript**        | 5.9       | Kiểu an toàn                     |
| **Vite**              | 7.3       | Build tool & Dev server          |
| **Tailwind CSS**      | 4.2       | Styling & Design system          |
| **React Router**      | 7.13      | Navigation & Routing             |
| **React Query**       | 5.90      | State management & data fetching |
| **Axios**             | 1.13      | HTTP client                      |
| **LiveKit**           | 2.17      | Video conferencing               |
| **WebSocket (STOMP)** | 7.3       | Real-time messaging              |
| **Framer Motion**     | 12.38     | Animations                       |
| **Recharts**          | 3.8       | Charts & Analytics               |
| **Radix UI**          | Latest    | UI Components                    |

### Backend

| Công nghệ           | Phiên bản | Mục đích                       |
| ------------------- | --------- | ------------------------------ |
| **Spring Boot**     | 3.2.4     | Framework                      |
| **Java**            | 17        | Ngôn ngữ                       |
| **MongoDB**         | Latest    | Database                       |
| **Spring Security** | Latest    | Authentication & Authorization |
| **JWT**             | 0.12.6    | Token-based auth               |
| **LiveKit SDK**     | 0.12.1    | Video conference backend       |
| **WebSocket**       | Latest    | Real-time communication        |
| **Cloudinary**      | 1.38      | File storage & CDN             |
| **Spring Mail**     | Latest    | Email service                  |
| **Jackson**         | Latest    | JSON serialization             |
| **Lombok**          | 1.18.44   | Code generation                |

## 📋 Yêu cầu hệ thống

### Frontend

- Node.js 18.x hoặc cao hơn
- npm 9.x hoặc yarn 3.x

### Backend

- Java 17 JDK
- Maven 3.8.x
- MongoDB 5.0 hoặc cao hơn (hoặc MongoDB Atlas)

## 🚀 Hướng dẫn cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd WebHocTap
```

### 2. Cài đặt & Chạy Backend

#### Cấu hình MongoDB

```bash
# Nếu dùng local MongoDB
mongod

# Hoặc cập nhật kết nối MongoDB trong application.properties
# spring.data.mongodb.uri=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
```

#### Chạy Server

```bash
cd Server
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại `http://localhost:8080`

### 3. Cài đặt & Chạy Frontend

```bash
cd Client
npm install
npm run dev
```

Frontend sẽ mở tại `http://localhost:5173`

## 📡 API Endpoints chính

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/refresh` - Làm mới token

### Courses (Khóa học)

- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học (Giáo viên)
- `PUT /api/courses/:id` - Cập nhật khóa học
- `DELETE /api/courses/:id` - Xóa khóa học

### Lessons (Bài giảng)

- `GET /api/lessons` - Lấy danh sách bài giảng
- `GET /api/lessons/:id` - Chi tiết bài giảng
- `POST /api/lessons` - Tạo bài giảng
- `PUT /api/lessons/:id` - Cập nhật bài giảng

### Quizzes (Bài kiểm tra)

- `GET /api/quizzes` - Danh sách bài kiểm tra
- `GET /api/quizzes/:id` - Chi tiết bài kiểm tra
- `POST /api/quizzes/:id/submit` - Nộp bài kiểm tra
- `GET /api/quizzes/:id/results` - Xem kết quả

### Live Sessions (Lớp học trực tiếp)

- `GET /api/live-sessions` - Danh sách phiên livestream
- `POST /api/live-sessions` - Tạo phiên livestream (Giáo viên)
- `POST /api/live-sessions/:id/start` - Bắt đầu livestream
- `POST /api/live-sessions/:id/end` - Kết thúc livestream
- `WebSocket: /ws/live/:sessionId` - Kết nối real-time

### Enrollments (Đăng ký)

- `POST /api/enrollments` - Đăng ký khóa học
- `GET /api/enrollments` - Khóa học của tôi
- `DELETE /api/enrollments/:id` - Hủy đăng ký

### Categories (Danh mục)

- `GET /api/categories` - Danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Quản trị)

## 🔐 Bảo mật

- ✅ JWT Token-based Authentication
- ✅ Spring Security với Role-based Access Control
- ✅ Mã hóa dữ liệu nhạy cảm
- ✅ CORS configuration
- ✅ OAuth2 support
- ✅ Input validation & sanitization

## 📁 Cấu trúc thư mục Frontend

```
Client/src/
├── components/
│   ├── admin/           # Component admin-exclusive
│   ├── instructor/      # Component giáo viên
│   ├── common/          # Navbar, Footer, v.v
│   └── ui/              # UI components (Button, Modal, etc)
├── pages/
│   ├── admin/           # Trang quản trị
│   ├── instructor/      # Trang giáo viên
│   ├── live/            # Trang livestream
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── CoursesPage.tsx
│   ├── QuizPage.tsx
│   └── ProfilePage.tsx
├── hooks/               # Custom React hooks
├── api/                 # API client functions
├── types/               # TypeScript definitions
├── utils/               # Helper functions
├── App.tsx              # Main routing
└── main.tsx             # Entry point
```

## 📁 Cấu trúc thư mục Backend

```
Server/src/main/java/com/example/WebHocTap/
├── controller/          # REST API endpoints
│   ├── AuthController.java
│   ├── CourseController.java
│   ├── LessonController.java
│   ├── QuizController.java
│   ├── LiveSessionController.java
│   └── ...
├── service/             # Business logic
├── repository/          # MongoDB access
├── model/               # Data models
├── config/              # Spring configuration
├── security/            # JWT & Security
└── WebHocTapApplication.java
```

## 🧪 Testing

### Frontend

```bash
cd Client
npm run lint
```

### Backend

```bash
cd Server
mvn test
```

## 🔑 Các biến môi trường quan trọng

### Backend (`application.properties` hoặc `application.yml`)

```properties
# Server
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017
spring.data.mongodb.database=webhoctap

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Cloudinary
cloudinary.cloud_name=your-cloud-name
cloudinary.api_key=your-api-key
cloudinary.api_secret=your-api-secret

# LiveKit
livekit.url=https://your-livekit-server
livekit.api_key=your-api-key
livekit.api_secret=your-api-secret

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Frontend (`.env` file)

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_LIVEKIT_URL=https://your-livekit-server
```

## 🤝 Đóng góp

Chúng tôi chào đón các đóng góp! Vui lòng:

1. Fork dự án
2. Tạo branch tính năng mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được cấp phép theo [MIT License](LICENSE).

## 📧 Liên hệ & Hỗ trợ

- 📧 Email: support@webhoctap.com
- 🐛 Issue Tracker: [GitHub Issues](../../issues)
- 💬 Discussion: [GitHub Discussions](../../discussions)

## 👨‍💻 Các tác giả

- Nhóm phát triển WebHocTap

---

**Chúc bạn có trải nghiệm tuyệt vời với WebHocTap!** 🎉
