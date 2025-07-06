import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import Calendar from '../../components/Calendar'
import Modal from '../../components/Modal'
import { 
  Users, 
  LogOut, 
  BookOpen, 
  Clock, 
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw
} from 'lucide-react'

const AdminMain: React.FC = () => {
  const { state, dispatch, createClass, updateClass, deleteClass, initializeDatabase } = useAttendance()
  const navigate = useNavigate()
  
  // 인증 확인 - 관리자 로그인 상태가 아니면 로그인 페이지로 이동
  useEffect(() => {
    if (!state.adminLoggedIn) {
      navigate('/admin')
    }
  }, [state.adminLoggedIn, navigate])
  
  // 수업 생성 폼 상태
  const [newClass, setNewClass] = useState({
    title: '',
    time: '',
    maxStudents: 5,
    description: ''
  })
  
  // 수업에 예약된 학생 수 계산 함수
  const getBookedStudentsCount = (classItem: any) => {
    return classItem.class_bookings ? classItem.class_bookings.length : 0
  }
  
  // 현재 선택된 날짜의 수업 목록
  const selectedDateClasses = state.classes.filter(
    cls => cls.date === state.selectedDate
  )
  
  // 로그아웃 처리
  const handleLogout = () => {
    dispatch({ type: 'ADMIN_LOGOUT' })
    navigate('/admin')
  }
  
  // 데이터 초기화 처리
  const handleResetData = async () => {
    if (window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await initializeDatabase()
      alert('데이터가 초기화되었습니다.')
    }
  }
  
  // 학생 관리 페이지로 이동
  const handleGoToMembers = () => {
    navigate('/admin/main/member')
  }
  
  // 날짜 선택 처리
  const handleDateSelect = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }
  
  // 수업 생성 모달 열기
  const handleCreateClass = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'createClass' } 
    })
  }
  
  // 수업 수정 모달 열기
  const handleEditClass = (classItem: any) => {
    setNewClass({
      title: classItem.title,
      time: classItem.time,
      maxStudents: classItem.max_students,
      description: classItem.description || ''
    })
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'editClass', class: classItem } 
    })
  }
  
  // 수업 삭제
  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      await deleteClass(classId)
    }
  }
  
  // 수업 저장 (생성 또는 수정)
  const handleSaveClass = async () => {
    if (!newClass.title || !newClass.time) {
      alert('수업 제목과 시간을 입력해주세요.')
      return
    }
    
    if (state.modalType === 'createClass') {
      // 새 수업 생성
      await createClass({
        title: newClass.title,
        date: state.selectedDate,
        time: newClass.time,
        max_students: newClass.maxStudents,
        description: newClass.description
      })
    } else if (state.modalType === 'editClass' && state.selectedClass) {
      // 기존 수업 수정
      await updateClass(state.selectedClass.id, {
        title: newClass.title,
        time: newClass.time,
        max_students: newClass.maxStudents,
        description: newClass.description
      })
    }
    
    // 폼 초기화 및 모달 닫기
    setNewClass({
      title: '',
      time: '',
      maxStudents: 5,
      description: ''
    })
    dispatch({ type: 'CLOSE_MODAL' })
  }
  
  // 모달 닫기
  const handleCloseModal = () => {
    setNewClass({
      title: '',
      time: '',
      maxStudents: 5,
      description: ''
    })
    dispatch({ type: 'CLOSE_MODAL' })
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }
  
  return (
    <div className="mobile-container">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">관리자 대시보드</h1>
            <p className="text-sm text-gray-600">출석체크 관리</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoToMembers}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="학생 관리"
            >
              <Users size={20} />
            </button>
            <button
              onClick={handleResetData}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="데이터 초기화"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="p-4 space-y-4">
        {/* 달력 */}
        <Calendar
          selectedDate={state.selectedDate}
          onDateSelect={handleDateSelect}
          onCreateClass={handleCreateClass}
          classes={state.classes.map(cls => ({
            id: cls.id,
            title: cls.title,
            date: cls.date,
            time: cls.time,
            currentStudents: getBookedStudentsCount(cls),
            maxStudents: cls.max_students
          }))}
          isAdmin={true}
        />
        
        {/* 선택된 날짜의 수업 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {formatDate(state.selectedDate)} 수업
            </h2>
          </div>
          
          {selectedDateClasses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
              <p>선택된 날짜에 등록된 수업이 없습니다.</p>
              <button
                onClick={() => handleCreateClass(state.selectedDate)}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                수업 생성하기
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {selectedDateClasses.map(classItem => (
                <div key={classItem.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Clock size={14} className="mr-1" />
                        {classItem.time}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <UserPlus size={14} className="mr-1" />
                        {getBookedStudentsCount(classItem)}/{classItem.max_students}명
                      </div>
                      {classItem.description && (
                        <p className="mt-2 text-sm text-gray-600">{classItem.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditClass(classItem)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem.id)}
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
      </div>
      
      {/* 수업 생성/수정 모달 */}
      <Modal
        isOpen={state.isModalOpen && (state.modalType === 'createClass' || state.modalType === 'editClass')}
        onClose={handleCloseModal}
        title={state.modalType === 'createClass' ? '새 수업 생성' : '수업 수정'}
      >
        <div className="space-y-4">
          {/* 수업 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 제목
            </label>
            <input
              type="text"
              value={newClass.title}
              onChange={(e) => setNewClass({...newClass, title: e.target.value})}
              className="input-field"
              placeholder="수업 제목을 입력하세요"
            />
          </div>
          
          {/* 수업 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 시간
            </label>
            <select
              value={newClass.time}
              onChange={(e) => setNewClass({...newClass, time: e.target.value})}
              className="input-field"
            >
              <option value="">시간을 선택하세요</option>
              <option value="09:00">오전 09:00</option>
              <option value="09:30">오전 09:30</option>
              <option value="10:00">오전 10:00</option>
              <option value="10:30">오전 10:30</option>
              <option value="11:00">오전 11:00</option>
              <option value="11:30">오전 11:30</option>
              <option value="12:00">오후 12:00</option>
              <option value="12:30">오후 12:30</option>
              <option value="13:00">오후 01:00</option>
              <option value="13:30">오후 01:30</option>
              <option value="14:00">오후 02:00</option>
              <option value="14:30">오후 02:30</option>
              <option value="15:00">오후 03:00</option>
              <option value="15:30">오후 03:30</option>
              <option value="16:00">오후 04:00</option>
              <option value="16:30">오후 04:30</option>
              <option value="17:00">오후 05:00</option>
              <option value="17:30">오후 05:30</option>
              <option value="18:00">오후 06:00</option>
              <option value="18:30">오후 06:30</option>
              <option value="19:00">오후 07:00</option>
              <option value="19:30">오후 07:30</option>
              <option value="20:00">오후 08:00</option>
              <option value="20:30">오후 08:30</option>
              <option value="21:00">오후 09:00</option>
              <option value="21:30">오후 09:30</option>
            </select>
          </div>
          
          {/* 최대 학생 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 학생 수
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={newClass.maxStudents}
              onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value) || 5})}
              className="input-field"
            />
          </div>
          
          {/* 수업 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 설명 (선택사항)
            </label>
            <textarea
              value={newClass.description}
              onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              className="input-field"
              rows={3}
              placeholder="수업에 대한 간단한 설명을 입력하세요"
            />
          </div>
          
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
              onClick={handleSaveClass}
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

export default AdminMain 