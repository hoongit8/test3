import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  onCreateClass?: (date: string) => void
  classes: Array<{
    id: string
    title: string
    date: string
    time: string
    currentStudents: number
    maxStudents: number
  }>
  isAdmin?: boolean
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onCreateClass,
  classes,
  isAdmin = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // 현재 월의 첫 번째 날과 마지막 날 계산
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  // 달력 시작일 (일요일부터)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  // 달력 종료일 (토요일까지)
  const endDate = new Date(lastDay)
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
  
  // 달력에 표시할 날짜들 생성
  const days = []
  const currentDateLoop = new Date(startDate)
  
  while (currentDateLoop <= endDate) {
    days.push(new Date(currentDateLoop))
    currentDateLoop.setDate(currentDateLoop.getDate() + 1)
  }
  
  // 이전/다음 달 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  // 오늘 날짜 확인
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  // 선택된 날짜 확인
  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDate
  }
  
  // 현재 월인지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }
  
  // 해당 날짜의 수업 개수 계산
  const getClassesForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return classes.filter(cls => cls.date === dateStr)
  }
  
  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (isCurrentMonth(date)) {
      const dateStr = formatDate(date)
      onDateSelect(dateStr)
      
      // 관리자인 경우 수업 생성 모달도 함께 열기
      if (isAdmin && onCreateClass) {
        onCreateClass(dateStr)
      }
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-lg font-semibold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dayClasses = getClassesForDate(date)
          const isCurrentMonthDate = isCurrentMonth(date)
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-2 min-h-[60px] border-b border-r cursor-pointer
                ${isCurrentMonthDate ? (isAdmin ? 'hover:bg-green-50' : 'hover:bg-gray-50') : 'text-gray-300'}
                ${isSelected(date) ? 'bg-primary-50' : ''}
              `}
              title={isAdmin && isCurrentMonthDate ? '클릭하여 수업 생성' : undefined}
            >
              {/* 날짜 */}
              <div className={`
                inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full
                ${isToday(date) ? 'bg-primary-600 text-white' : ''}
                ${isSelected(date) && !isToday(date) ? 'bg-primary-100 text-primary-800' : ''}
              `}>
                {date.getDate()}
              </div>
              
              {/* 수업 표시 */}
              {isCurrentMonthDate && (
                <div className="mt-1 space-y-1">
                  {dayClasses.slice(0, 2).map(cls => (
                    <div
                      key={cls.id}
                      className="text-xs bg-primary-100 text-primary-800 px-1 py-0.5 rounded truncate"
                    >
                      {cls.title}
                    </div>
                  ))}
                  {dayClasses.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayClasses.length - 2}개
                    </div>
                  )}
                </div>
              )}
              

            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar 