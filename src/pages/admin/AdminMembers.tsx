import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import Modal from '../../components/Modal'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

const AdminMembers: React.FC = () => {
  const { state, dispatch, createStudent, updateStudent, deleteStudent } = useAttendance()
  const navigate = useNavigate()
  
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('')
  
  // 학생 폼 상태
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    email: '',
    joinDate: ''
  })
  
  // 인증 확인
  useEffect(() => {
    if (!state.adminLoggedIn) {
      navigate('/admin')
    }
  }, [state.adminLoggedIn, navigate])
  
  // 학생 검색 필터링
  const filteredStudents = state.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  // 대시보드로 돌아가기
  const handleGoBack = () => {
    navigate('/admin/main')
  }
  
  // 학생 추가 모달 열기
  const handleAddStudent = () => {
    setStudentForm({
      name: '',
      phone: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0]
    })
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'addStudent' } 
    })
  }
  
  // 학생 수정 모달 열기
  const handleEditStudent = (student: any) => {
    setStudentForm({
      name: student.name,
      phone: student.phone,
      email: student.email || '',
      joinDate: student.join_date
    })
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'addStudent', student } 
    })
  }
  
  // 학생 삭제
  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('정말로 이 학생을 삭제하시겠습니까?')) {
      await deleteStudent(studentId)
    }
  }
  
  // 학생 저장 (추가 또는 수정)
  const handleSaveStudent = async () => {
    if (!studentForm.name || !studentForm.phone) {
      alert('학생 이름과 전화번호를 입력해주세요.')
      return
    }
    
    if (state.selectedStudent) {
      // 기존 학생 수정
      await updateStudent(state.selectedStudent.id, {
        name: studentForm.name,
        phone: studentForm.phone,
        email: studentForm.email || undefined
      })
    } else {
      // 새 학생 추가
      await createStudent({
        name: studentForm.name,
        phone: studentForm.phone,
        email: studentForm.email || undefined
      })
    }
    
    handleCloseModal()
  }
  
  // 모달 닫기
  const handleCloseModal = () => {
    setStudentForm({
      name: '',
      phone: '',
      email: '',
      joinDate: ''
    })
    dispatch({ type: 'CLOSE_MODAL' })
  }
  
  // 학생의 수업 개수 계산
  const getStudentClassCount = (studentId: string) => {
    return state.classes.filter(cls => 
      cls.class_bookings && cls.class_bookings.some(booking => booking.student_id === studentId)
    ).length
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  return (
    <div className="mobile-container">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors mr-2"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">학생 관리</h1>
              <p className="text-sm text-gray-600">등록된 학생 목록</p>
            </div>
          </div>
          <button
            onClick={handleAddStudent}
            className="p-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            title="학생 추가"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      {/* 검색바 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
            placeholder="학생 이름, 전화번호, 이메일로 검색"
          />
        </div>
      </div>
      
      {/* 학생 목록 */}
      <div className="p-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddStudent}
                className="btn-primary"
              >
                <Plus size={16} className="mr-2" />
                첫 번째 학생 추가
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <User size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600">
                          {getStudentClassCount(student.id)}개 수업 참여
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-13">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-2" />
                        {student.phone}
                      </div>
                      
                      {student.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {student.email}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        가입일: {formatDate(student.join_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 학생 추가/수정 모달 */}
      <Modal
        isOpen={state.isModalOpen && state.modalType === 'addStudent'}
        onClose={handleCloseModal}
        title={state.selectedStudent ? '학생 정보 수정' : '새 학생 추가'}
      >
        <div className="space-y-4">
          {/* 학생 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              학생 이름 *
            </label>
            <input
              type="text"
              value={studentForm.name}
              onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
              className="input-field"
              placeholder="학생 이름을 입력하세요"
            />
          </div>
          
          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 *
            </label>
            <input
              type="tel"
              value={studentForm.phone}
              onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
              className="input-field"
              placeholder="전화번호를 입력하세요"
            />
          </div>
          
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 (선택사항)
            </label>
            <input
              type="email"
              value={studentForm.email}
              onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
              className="input-field"
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          {/* 가입일 - 수정 모드일 때만 표시 */}
          {state.selectedStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가입일
              </label>
              <input
                type="date"
                value={studentForm.joinDate}
                onChange={(e) => setStudentForm({...studentForm, joinDate: e.target.value})}
                className="input-field"
                disabled
              />
            </div>
          )}
          
          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 btn-secondary"
            >
              <X size={16} className="mr-2" />
              취소
            </button>
            <button
              onClick={handleSaveStudent}
              className="flex-1 btn-primary"
            >
              <Save size={16} className="mr-2" />
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminMembers 