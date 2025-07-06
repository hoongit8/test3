import { Routes, Route, Navigate } from 'react-router-dom'
import { AttendanceProvider } from './contexts/AttendanceContext'

// 관리자 페이지들
import AdminLogin from './pages/admin/AdminLogin'
import AdminMain from './pages/admin/AdminMain'
import AdminMembers from './pages/admin/AdminMembers'

// 학생 페이지들
import StudentLogin from './pages/student/StudentLogin'
import StudentMain from './pages/student/StudentMain'

function App() {
  return (
    <AttendanceProvider>
      <div className="App">
        <Routes>
          {/* 기본 경로 - 관리자 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* 관리자 라우터 */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/main" element={<AdminMain />} />
          <Route path="/admin/main/member" element={<AdminMembers />} />
          
          {/* 학생 라우터 */}
          <Route path="/student" element={<StudentLogin />} />
          <Route path="/student/main" element={<StudentMain />} />
        </Routes>
      </div>
    </AttendanceProvider>
  )
}

export default App 