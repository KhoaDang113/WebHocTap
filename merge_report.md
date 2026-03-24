# Báo cáo xử lý Merge Conflict chi tiết

File này liệt kê các dòng code cụ thể từ phía bạn (`HEAD`) đã được hợp nhất hoặc thay đổi để đảm bảo code của người khác (`origin/dev`) hoạt động ổn định.

## 1. Client/src/components/admin/AdminSidebar.tsx
- **Dòng code của bạn (HEAD):**
  ```tsx
  import { ..., History } from "lucide-react";
  ...
  { to: "/admin/quizzes/attempts", icon: <History size={20} />, label: "Lịch sử thi" },
  ```
- **Xử lý:** Đã gộp icon `History` vào danh sách import cùng với `Home` (từ dev). Menu "Lịch sử thi" được giữ nguyên vị trí.

## 2. Client/src/hooks/index.ts
- **Dòng code của bạn (HEAD):**
  ```tsx
  export { useCourseQuizzes, useMyAverageScore } from "./useQuizzes";
  ```
- **Xử lý:** Toàn bộ các export mới từ `origin/dev` (từ dòng 46 đến 101) đã được thêm vào. Dòng export Quiz của bạn được chuyển xuống cuối file (dòng 103).

## 3. Client/src/pages/index.ts
- **Dòng code của bạn (HEAD):**
  ```tsx
  export { default as FavoritesPage } from './FavoritesPage'
  ```
- **Xử lý:** Giữ nguyên dòng của bạn và thêm `InstructorInteractionsPage` từ `origin/dev` vào dòng phía trên.

## 4. Client/src/pages/ProfilePage.tsx
- **Dòng code của bạn (HEAD):**
  ```tsx
  import { ..., useMyAverageScore } from "@/hooks";
  ...
  const { data: averageScore = 0 } = useMyAverageScore();
  ...
  <div className="text-3xl font-bold ...">{averageScore.toFixed(1)}</div>
  ```
- **Xử lý:** Đã kết hợp thêm `useRef`, `useLocation` và `coursesRef` (từ dev) để không làm hỏng tính năng cuộn trang của người khác. Code hiển thị điểm của bạn được giữ lại hoàn toàn.

---
**Tình trạng hiện tại:** Tất cả xung đột đã được giải quyết bằng phương pháp gộp (Merge). Không có code nào bị xóa bỏ.
