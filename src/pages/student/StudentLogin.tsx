import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import { User, Eye, EyeOff, UserCheck } from 'lucide-react'

const StudentLogin: React.FC = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { state, dispatch } = useAttendance()
  const navigate = useNavigate()
  
  // 로그인 처리 - 더미 데이터로 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      
      // 등록된 학생 중에서 전화번호로 찾기
      const foundStudent = state.students.find(student => student.phone === phone)
      
      if (foundStudent && password === '1234') {
        // 학생 로그인 성공
        dispatch({ type: 'STUDENT_LOGIN', payload: foundStudent })
        navigate('/student/main')
      } else {
        setErrorMessage('로그인에 실패했습니다. 전화번호와 비밀번호를 확인해주세요.')
      }
    } catch (error) {
      setErrorMessage('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="mobile-container">
      <div className="flex flex-col justify-center min-h-screen p-6">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">학생 로그인</h1>
          <p className="text-gray-600">출석체크 시스템에 로그인하세요</p>
        </div>
        
        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 전화번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="전화번호를 입력하세요"
              />
            </div>
          </div>
          
          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
          
          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '학생 로그인'}
          </button>
        </form>
        
        {/* 테스트 계정 안내 */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">테스트 계정</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>전화번호: 01012345678 (김철수)</p>
            <p>전화번호: 01098765432 (박영희)</p>
            <p>전화번호: 01055557777 (이민수)</p>
            <p className="mt-2 font-medium">모든 계정 비밀번호: 1234</p>
          </div>
        </div>
        
        {/* 관리자 로그인 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            관리자이신가요?{' '}
            <button
              onClick={() => navigate('/admin')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              관리자 로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin 