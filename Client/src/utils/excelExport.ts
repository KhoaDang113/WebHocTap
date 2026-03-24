import * as XLSX from 'xlsx';
import type { UserDTO, CourseDTO, QuizAttemptHistoryResponse } from '@/types';

// ─── Helper: Auto-width columns ────────────────────────────────────────────
function autoWidth(ws: XLSX.WorkSheet, data: Record<string, unknown>[]) {
  const keys = Object.keys(data[0] || {});
  ws['!cols'] = keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(maxLen + 4, 60) };
  });
}

// ─── Helper: Style header row ───────────────────────────────────────────────
function applyHeaderStyle(ws: XLSX.WorkSheet, colCount: number) {
  for (let c = 0; c < colCount; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'BFDBFE' } },
      },
    };
  }
}

// ─── Helper: Download the workbook ──────────────────────────────────────────
function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
}

// ─── Report 1: Danh sách Người dùng ────────────────────────────────────────
export function exportUsersReport(users: UserDTO[]) {
  const roleMap: Record<string, string> = {
    STUDENT: 'Sinh viên',
    TEACHER: 'Giảng viên',
    ADMIN: 'Quản trị viên',
  };

  const rows = users
    .filter((u) => u.role !== 'ADMIN')
    .map((u, i) => ({
      'STT': i + 1,
      'Họ và tên': u.fullName || u.username,
      'Tên đăng nhập': u.username,
      'Email': u.email,
      'Vai trò': roleMap[u.role] || u.role,
      'Trạng thái': u.isDeleted ? 'Đã xóa' : u.isLocked ? 'Bị khóa' : 'Hoạt động',
      'Ngày tham gia': u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—',
      'Cập nhật lần cuối': u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('vi-VN') : '—',
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  autoWidth(ws, rows);
  applyHeaderStyle(ws, Object.keys(rows[0] || {}).length);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Người dùng');
  downloadWorkbook(wb, 'BaoCao_NguoiDung');
}

// ─── Report 2: Danh sách Khóa học ──────────────────────────────────────────
export function exportCoursesReport(courses: CourseDTO[]) {
  const statusMap: Record<string, string> = {
    PUBLISHED: 'Đã phát hành',
    DRAFT: 'Bản nháp',
    ARCHIVED: 'Đã lưu trữ',
  };

  const rows = courses.map((c, i) => ({
    'STT': i + 1,
    'Tên khóa học': c.title,
    'Giảng viên': c.instructor || '—',
    'Giá (VNĐ)': c.price ?? 0,
    'Trạng thái': statusMap[c.status] || c.status,
    'Riêng tư': c.isPrivate ? 'Có' : 'Không',
    'Đánh giá TB': c.averageRating != null ? Number(c.averageRating).toFixed(1) : '—',
    'Số đánh giá': c.reviewCount ?? 0,
    'Ngày tạo': c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  autoWidth(ws, rows);
  applyHeaderStyle(ws, Object.keys(rows[0] || {}).length);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Khóa học');
  downloadWorkbook(wb, 'BaoCao_KhoaHoc');
}

// ─── Report 3: Kết quả Quiz ─────────────────────────────────────────────────
export function exportQuizAttemptsReport(attempts: QuizAttemptHistoryResponse[]) {
  const rows = attempts.map((a, i) => ({
    'STT': i + 1,
    'Học viên': a.fullName || a.username,
    'Tên đăng nhập': a.username,
    'Khóa học': a.courseTitle || '—',
    'Bài kiểm tra': a.quizTitle || '—',
    'Điểm số': a.score != null ? a.score : '—',
    'Câu đúng': a.correctAnswers != null ? a.correctAnswers : '—',
    'Tổng câu': a.totalQuestions != null ? a.totalQuestions : '—',
    'Tỷ lệ đúng (%)':
      a.correctAnswers != null && a.totalQuestions
        ? Math.round((a.correctAnswers / a.totalQuestions) * 100)
        : '—',
    'Đã nộp bài': a.submitted ? 'Có' : 'Không',
    'Thời gian bắt đầu': a.startTime ? new Date(a.startTime).toLocaleString('vi-VN') : '—',
    'Thời gian kết thúc': a.endTime ? new Date(a.endTime).toLocaleString('vi-VN') : '—',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  autoWidth(ws, rows);
  applyHeaderStyle(ws, Object.keys(rows[0] || {}).length);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kết quả Quiz');
  downloadWorkbook(wb, 'BaoCao_KetQuaQuiz');
}

// ─── Report 4: Báo cáo Tổng hợp ────────────────────────────────────────────
export function exportSummaryReport(
  users: UserDTO[],
  courses: CourseDTO[],
  quizAttempts: QuizAttemptHistoryResponse[]
) {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Tổng quan ---
  const students = users.filter((u) => u.role === 'STUDENT');
  const teachers = users.filter((u) => u.role === 'TEACHER');
  const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED');
  const avgScore =
    quizAttempts.length > 0
      ? (quizAttempts.reduce((acc, a) => acc + (a.score ?? 0), 0) / quizAttempts.length).toFixed(1)
      : '0';

  const summaryRows = [
    { 'Chỉ số': 'Tổng số Sinh viên', 'Giá trị': students.length },
    { 'Chỉ số': 'Tổng số Giảng viên', 'Giá trị': teachers.length },
    { 'Chỉ số': 'Tổng số người dùng (không kể Admin)', 'Giá trị': users.filter(u => u.role !== 'ADMIN').length },
    { 'Chỉ số': 'Tài khoản bị khóa', 'Giá trị': users.filter((u) => u.isLocked).length },
    { 'Chỉ số': 'Khóa học đã phát hành', 'Giá trị': publishedCourses.length },
    { 'Chỉ số': 'Tổng số khóa học', 'Giá trị': courses.length },
    { 'Chỉ số': 'Tổng lượt làm Quiz', 'Giá trị': quizAttempts.length },
    { 'Chỉ số': 'Điểm Quiz trung bình hệ thống', 'Giá trị': avgScore },
    { 'Chỉ số': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleString('vi-VN') },
  ];
  const ws1 = XLSX.utils.json_to_sheet(summaryRows);
  autoWidth(ws1, summaryRows);
  applyHeaderStyle(ws1, 2);
  XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

  // --- Sheet 2: Người dùng ---
  const roleMap: Record<string, string> = { STUDENT: 'Sinh viên', TEACHER: 'Giảng viên', ADMIN: 'Quản trị viên' };
  const userRows = users
    .filter((u) => u.role !== 'ADMIN')
    .map((u, i) => ({
      'STT': i + 1,
      'Họ và tên': u.fullName || u.username,
      'Email': u.email,
      'Vai trò': roleMap[u.role] || u.role,
      'Trạng thái': u.isDeleted ? 'Đã xóa' : u.isLocked ? 'Bị khóa' : 'Hoạt động',
      'Ngày tham gia': u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—',
    }));
  const ws2 = XLSX.utils.json_to_sheet(userRows);
  autoWidth(ws2, userRows);
  applyHeaderStyle(ws2, Object.keys(userRows[0] || {}).length);
  XLSX.utils.book_append_sheet(wb, ws2, 'Người dùng');

  // --- Sheet 3: Khóa học ---
  const statusMap: Record<string, string> = { PUBLISHED: 'Đã phát hành', DRAFT: 'Bản nháp', ARCHIVED: 'Lưu trữ' };
  const courseRows = courses.map((c, i) => ({
    'STT': i + 1,
    'Tên khóa học': c.title,
    'Giảng viên': c.instructor || '—',
    'Giá (VNĐ)': c.price ?? 0,
    'Trạng thái': statusMap[c.status] || c.status,
    'Ngày tạo': c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—',
  }));
  const ws3 = XLSX.utils.json_to_sheet(courseRows);
  autoWidth(ws3, courseRows);
  applyHeaderStyle(ws3, Object.keys(courseRows[0] || {}).length);
  XLSX.utils.book_append_sheet(wb, ws3, 'Khóa học');

  downloadWorkbook(wb, 'BaoCao_TongHop');
}
