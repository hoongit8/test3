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
    console.log('🔍 AdminMain - 관리자 인증 상태 확인 시작')
    console.log('📊 state.adminLoggedIn:', state.adminLoggedIn)
    
    // localStorage에서 관리자 사용자 정보 확인
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null')
    console.log('💾 localStorage adminUser:', adminUser)
    
    const isAdminLoggedIn = state.adminLoggedIn || !!adminUser
    
    if (!isAdminLoggedIn) {
      console.log('🚫 관리자 인증 실패 - 로그인 페이지로 이동')
      console.log('❌ isAdminLoggedIn:', isAdminLoggedIn)
      navigate('/admin')
    } else {
      console.log('✅ 관리자 인증 확인됨')
      // localStorage에 로그인 상태가 있는데 state에 없으면 state 업데이트
      if (!state.adminLoggedIn && adminUser) {
        console.log('🔄 localStorage에서 관리자 로그인 상태 복원 중...')
        dispatch({ type: 'ADMIN_LOGIN' })
      }
    }
  }, [state.adminLoggedIn, navigate, dispatch])
  
  // 수업 생성 폼 상태
  const [newClass, setNewClass] = useState({
    title: '',
    time: '',
    maxStudents: 5,
    description: ''
  })
  
  // 시간 선택을 위한 별도 상태 추가
  const [timeSelection, setTimeSelection] = useState({
    hour: '',
    minute: '',
    period: 'AM'
  })
  
  // 수업에 예약된 학생 수 계산 함수
  const getBookedStudentsCount = (classItem: any) => {
    return classItem.class_bookings ? classItem.class_bookings.length : 0
  }
  
  // 수업에 신청한 학생들의 이름 목록 가져오기 함수
  const getBookedStudentsNames = (classItem: any): string[] => {
    if (!classItem.class_bookings) return []
    return classItem.class_bookings.map((booking: any) => 
      booking.students?.name || '알 수 없음'
    )
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
    // 기존 시간을 파싱하여 시간 선택 상태로 변환
    const [hour, minute] = classItem.time.split(':')
    const hourInt = parseInt(hour)
    const period = hourInt >= 12 ? 'PM' : 'AM'
    const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt
    
    setNewClass({
      title: classItem.title,
      time: classItem.time,
      maxStudents: classItem.max_students,
      description: classItem.description || ''
    })
    
    setTimeSelection({
      hour: displayHour.toString(),
      minute: minute,
      period: period
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
    console.log('🔧 수업 저장 시작')
    console.log('📋 수업 데이터:', newClass)
    console.log('📅 선택된 날짜:', state.selectedDate)
    console.log('🎯 모달 타입:', state.modalType)
    
    if (!newClass.title || !newClass.time) {
      alert('수업 제목과 시간을 입력해주세요.')
      return
    }
    
    try {
      if (state.modalType === 'createClass') {
        console.log('✨ 새 수업 생성 시작')
        // 새 수업 생성
        const classData = {
          title: newClass.title,
          date: state.selectedDate,
          time: newClass.time,
          max_students: newClass.maxStudents,
          description: newClass.description
        }
        console.log('📝 전송할 데이터:', classData)
        
        const result = await createClass(classData)
        console.log('✅ 수업 생성 결과:', result)
        
      } else if (state.modalType === 'editClass' && state.selectedClass) {
        console.log('✏️ 수업 수정 시작')
        // 기존 수업 수정
        const updateData = {
          title: newClass.title,
          time: newClass.time,
          max_students: newClass.maxStudents,
          description: newClass.description
        }
        console.log('📝 수정할 데이터:', updateData)
        
        const result = await updateClass(state.selectedClass.id, updateData)
        console.log('✅ 수업 수정 결과:', result)
      }
      
      // 폼 초기화 및 모달 닫기
      setNewClass({
        title: '',
        time: '',
        maxStudents: 5,
        description: ''
      })
      setTimeSelection({
        hour: '',
        minute: '',
        period: 'AM'
      })
      dispatch({ type: 'CLOSE_MODAL' })
      
      console.log('🎉 수업 저장 완료')
      
    } catch (error) {
      console.error('❌ 수업 저장 실패:', error)
      alert('수업 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }
  
  // 모달 닫기
  const handleCloseModal = () => {
    setNewClass({
      title: '',
      time: '',
      maxStudents: 5,
      description: ''
    })
    setTimeSelection({
      hour: '',
      minute: '',
      period: 'AM'
    })
    dispatch({ type: 'CLOSE_MODAL' })
  }
  
  // 시간 선택 변경 핸들러
  const handleTimeChange = (field: 'hour' | 'minute' | 'period', value: string) => {
    const newTimeSelection = { ...timeSelection, [field]: value }
    setTimeSelection(newTimeSelection)
    
    // 시간과 분이 모두 선택되었을 때 time 필드 업데이트
    if (newTimeSelection.hour && newTimeSelection.minute) {
      let hour24 = parseInt(newTimeSelection.hour)
      if (newTimeSelection.period === 'PM' && hour24 !== 12) {
        hour24 += 12
      } else if (newTimeSelection.period === 'AM' && hour24 === 12) {
        hour24 = 0
      }
      
      const timeString = `${hour24.toString().padStart(2, '0')}:${newTimeSelection.minute}`
      setNewClass({ ...newClass, time: timeString })
    }
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
          onDeleteClass={handleDeleteClass}
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
                      
                      {/* 신청한 학생들 목록 */}
                      {getBookedStudentsNames(classItem).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">신청한 학생들:</h4>
                          <div className="flex flex-wrap gap-2">
                            {getBookedStudentsNames(classItem).map((studentName, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                              >
                                {studentName}
                              </span>
                            ))}
                          </div>
                        </div>
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
          
          {/* 수업 시간 - 개선된 시간 선택기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 시간
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* 시간 선택 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">시</label>
                <select
                  value={timeSelection.hour}
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">선택</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString()}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 분 선택 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">분</label>
                <select
                  value={timeSelection.minute}
                  onChange={(e) => handleTimeChange('minute', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">선택</option>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
              
              {/* 오전/오후 선택 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">오전/오후</label>
                <select
                  value={timeSelection.period}
                  onChange={(e) => handleTimeChange('period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
              </div>
            </div>
            
            {/* 선택된 시간 미리보기 */}
            {newClass.time && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  선택된 시간: <span className="font-medium">{newClass.time}</span>
                  {timeSelection.hour && timeSelection.minute && (
                    <span className="ml-2">
                      ({timeSelection.period === 'AM' ? '오전' : '오후'} {timeSelection.hour}:{timeSelection.minute})
                    </span>
                  )}
                </p>
              </div>
            )}
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