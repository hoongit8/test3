import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import Calendar from '../../components/Calendar'
import Modal from '../../components/Modal'
import { 
  LogOut, 
  BookOpen, 
  Clock, 
  User, 
  Check, 
  X,
  Calendar as CalendarIcon,
  UserPlus
} from 'lucide-react'

const StudentMain: React.FC = () => {
  const { state, dispatch, bookClass, cancelBooking } = useAttendance()
  const navigate = useNavigate()
  
  // 수업 상세 모달 상태
  const [showClassModal, setShowClassModal] = useState(false)
  const [selectedDateForModal, setSelectedDateForModal] = useState('')
  
  // 인증 확인 - 학생 로그인 상태가 아니면 로그인 페이지로 이동
  useEffect(() => {
    console.log('🔍 학생 인증 상태 확인 시작')
    console.log('📊 state.studentLoggedIn:', state.studentLoggedIn)
    console.log('📊 state.currentStudent:', state.currentStudent)
    console.log('💾 localStorage studentLoggedIn:', localStorage.getItem('studentLoggedIn'))
    console.log('💾 localStorage currentStudent:', localStorage.getItem('currentStudent'))
    
    // localStorage와 state 모두 확인하여 더 안정적인 인증 체크
    const isStudentLoggedIn = state.studentLoggedIn || localStorage.getItem('studentLoggedIn') === 'true'
    const storedStudentData = localStorage.getItem('currentStudent')
    const currentStudent = state.currentStudent || (storedStudentData ? JSON.parse(storedStudentData) : null)
    
    if (!isStudentLoggedIn || !currentStudent) {
      console.log('🚫 학생 인증 실패 - 로그인 페이지로 이동')
      console.log('❌ isStudentLoggedIn:', isStudentLoggedIn)
      console.log('❌ currentStudent:', currentStudent)
      navigate('/student')
    } else {
      console.log('✅ 학생 인증 확인됨:', currentStudent.name)
      // localStorage에 로그인 상태가 있는데 state에 없으면 state 업데이트
      if (!state.studentLoggedIn && localStorage.getItem('studentLoggedIn') === 'true' && currentStudent) {
        console.log('🔄 localStorage에서 로그인 상태 복원 중...')
        dispatch({ type: 'STUDENT_LOGIN', payload: currentStudent })
      }
    }
  }, [state.studentLoggedIn, state.currentStudent, navigate, dispatch])
  
  // 수업에 예약된 학생 수 계산 함수
  const getBookedStudentsCount = (classItem: any) => {
    return classItem.class_bookings ? classItem.class_bookings.length : 0
  }
  
  // 현재 학생 정보 가져오기 (state 또는 localStorage에서)
  const currentStudent = state.currentStudent || (localStorage.getItem('currentStudent') ? JSON.parse(localStorage.getItem('currentStudent')!) : null)
  
  // 현재 학생이 예약한 수업인지 확인 함수
  const isStudentBooked = (classItem: any) => {
    if (!currentStudent || !classItem.class_bookings) return false
    return classItem.class_bookings.some((booking: any) => 
      booking.student_id === currentStudent?.id
    )
  }
  
  // 현재 학생이 등록된 수업들
  const myClasses = state.classes.filter(cls => isStudentBooked(cls))
  
  // 선택된 날짜의 수업들 (전체)
  const selectedDateClasses = state.classes.filter(
    cls => cls.date === state.selectedDate
  )
  
  // 선택된 날짜의 내 수업들
  const mySelectedDateClasses = selectedDateClasses.filter(cls => isStudentBooked(cls))
  
  // 예약 가능한 수업들 (선택된 날짜에서 내가 참여하지 않은 수업들)
  // const availableClasses = selectedDateClasses.filter(cls => 
  //   !isStudentBooked(cls) && getBookedStudentsCount(cls) < cls.max_students
  // )
  
  // 모달용 선택된 날짜의 수업들
  const modalDateClasses = state.classes.filter(
    cls => cls.date === selectedDateForModal
  )
  
  // 모달용 내 수업들
  const modalMyClasses = modalDateClasses.filter(cls => isStudentBooked(cls))
  
  // 모달용 예약 가능한 수업들
  const modalAvailableClasses = modalDateClasses.filter(cls => 
    !isStudentBooked(cls) && getBookedStudentsCount(cls) < cls.max_students
  )
  
  // 로그아웃 처리
  const handleLogout = () => {
    dispatch({ type: 'STUDENT_LOGOUT' })
    navigate('/student')
  }
  
  // 날짜 선택 처리 (달력에서 날짜 클릭)
  const handleDateSelect = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    
    // 해당 날짜에 수업이 있으면 모달 열기
    const dateClasses = state.classes.filter(cls => cls.date === date)
    if (dateClasses.length > 0) {
      setSelectedDateForModal(date)
      setShowClassModal(true)
    }
  }
  
  // 수업 예약
  const handleBookClass = async (classId: string) => {
    if (currentStudent) {
      await bookClass(classId, currentStudent.id)
    }
  }
  
  // 수업 취소
  const handleCancelClass = async (classId: string) => {
    if (currentStudent && window.confirm('정말로 이 수업을 취소하시겠습니까?')) {
      await cancelBooking(classId, currentStudent.id)
    }
  }
  
  // 모달 닫기
  const handleCloseModal = () => {
    setShowClassModal(false)
    setSelectedDateForModal('')
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }
  
  // 로그인하지 않은 상태면 렌더링하지 않음
  if (!currentStudent) {
    return null
  }
  
  return (
    <div className="mobile-container">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentStudent.name}님
              </h1>
              <p className="text-sm text-gray-600">학생 대시보드</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      {/* 요약 정보 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {myClasses.length}
            </div>
            <div className="text-sm text-gray-600">참여 중인 수업</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {mySelectedDateClasses.length}
            </div>
            <div className="text-sm text-gray-600">선택된 날짜 수업</div>
          </div>
        </div>
      </div>
      
      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border-b">
        <p className="text-sm text-blue-800 text-center">
          📅 달력에서 <span className="font-semibold">수업이 있는 날짜</span>를 클릭하면 수업 신청/취소가 가능합니다!
        </p>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="p-4 space-y-4">
        {/* 달력 - 전체 수업 표시 (학생은 모든 수업을 볼 수 있어야 함) */}
        <Calendar
          selectedDate={state.selectedDate}
          onDateSelect={handleDateSelect}
          classes={state.classes.map(cls => ({
            id: cls.id,
            title: cls.title,
            date: cls.date,
            time: cls.time,
            currentStudents: getBookedStudentsCount(cls),
            maxStudents: cls.max_students
          }))}
          isAdmin={false}
        />
        
        {/* 내 수업 전체 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">내 수업 목록</h2>
          </div>
          
          {myClasses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
              <p>아직 참여 중인 수업이 없습니다.</p>
              <p className="text-sm mt-1">달력에서 수업을 선택하여 예약해보세요!</p>
            </div>
          ) : (
            <div className="divide-y">
              {myClasses.map(classItem => (
                <div key={classItem.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <CalendarIcon size={14} className="mr-1" />
                        {formatDate(classItem.date)}
                      </div>
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
                    <button
                      onClick={() => handleCancelClass(classItem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="수업 취소"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 수업 신청/취소 모달 */}
      <Modal
        isOpen={showClassModal}
        onClose={handleCloseModal}
        title={`${formatDate(selectedDateForModal)} 수업 관리`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* 내가 신청한 수업 */}
          {modalMyClasses.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Check size={16} className="mr-2 text-green-600" />
                신청한 수업
              </h3>
              <div className="space-y-3">
                {modalMyClasses.map(classItem => (
                  <div key={classItem.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{classItem.title}</h4>
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
                      <button
                        onClick={() => {
                          handleCancelClass(classItem.id)
                          // 수업 취소 후 모달 데이터 업데이트를 위해 약간의 딜레이
                          setTimeout(() => {
                            // 모달이 여전히 열려있고 해당 날짜에 수업이 없으면 모달 닫기
                            const remainingClasses = state.classes.filter(cls => 
                              cls.date === selectedDateForModal && 
                              (isStudentBooked(cls) || (!isStudentBooked(cls) && getBookedStudentsCount(cls) < cls.max_students))
                            )
                            if (remainingClasses.length === 0) {
                              handleCloseModal()
                            }
                          }, 100)
                        }}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 신청 가능한 수업 */}
          {modalAvailableClasses.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <BookOpen size={16} className="mr-2 text-blue-600" />
                신청 가능한 수업
              </h3>
              <div className="space-y-3">
                {modalAvailableClasses.map(classItem => (
                  <div key={classItem.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{classItem.title}</h4>
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
                      <button
                        onClick={() => {
                          handleBookClass(classItem.id)
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors"
                      >
                        신청
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 모든 수업이 마감된 경우 */}
          {modalDateClasses.length > 0 && 
           modalMyClasses.length === 0 && 
           modalAvailableClasses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">이 날짜의 모든 수업이 마감되었습니다.</p>
            </div>
          )}
          
          {/* 수업이 없는 경우 */}
          {modalDateClasses.length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">이 날짜에는 등록된 수업이 없습니다.</p>
            </div>
          )}
          
          {/* 닫기 버튼 */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StudentMain 