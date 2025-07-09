import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import { User, Eye, EyeOff, UserCheck, RefreshCw } from 'lucide-react'

const StudentLogin: React.FC = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { state, loginStudent, initializeDatabase } = useAttendance()
  const navigate = useNavigate()
  
  // 로그인 처리 - Supabase 데이터베이스 연동
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const success = await loginStudent(phone, password)
      
      if (success) {
        // 학생 로그인 성공
        navigate('/student/main')
      } else {
        // 에러 메시지는 Context에서 설정됨
        setErrorMessage(state.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setErrorMessage('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 데이터베이스 초기화 처리
  const handleInitializeDatabase = async () => {
    try {
      await initializeDatabase()
      setErrorMessage('')
      alert('데이터베이스가 초기화되었습니다. 다시 로그인해주세요.')
    } catch (error) {
      setErrorMessage('데이터베이스 초기화에 실패했습니다.')
    }
  }
  
  return (
    <div className="mobile-container">
      {/* 그라데이션 배경 */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="flex flex-col justify-center min-h-screen p-6">
          {/* 메인 이미지 */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-6">
              {/* 로고 이미지 */}
              <div className="mx-auto w-64 h-64 mb-4 flex items-center justify-center">
                <img 
                  src="/images/logo.png" 
                  alt="출석체크 시스템 로고" 
                  className="w-64 h-64 object-contain drop-shadow-lg"
                  onError={(e) => {
                    // 이미지 로드 실패 시 기본 아이콘으로 대체
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    // 대체 아이콘 표시
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                {/* 대체 아이콘 (이미지 로드 실패 시 표시) */}
                <div 
                  className="w-64 h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl"
                  style={{ display: 'none' }}
                >
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                    <UserCheck className="w-24 h-24 text-green-600" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">출석체크 시스템</h1>
              <p className="text-gray-600">학생 로그인</p>
            </div>
          </div>
          
          {/* 로그인 폼 - 카드 스타일 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mx-auto w-full max-w-md border border-white/20">
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
          {(errorMessage || state.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errorMessage || state.error}</p>
            </div>
          )}
          
          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading || state.loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || state.loading ? '로그인 중...' : '학생 로그인'}
          </button>
        </form>
        
        {/* 데이터베이스 초기화 버튼 */}
        <div className="mt-4">
          <button
            onClick={handleInitializeDatabase}
            disabled={state.loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {state.loading ? '초기화 중...' : '데이터베이스 초기화'}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            로그인이 안 되면 클릭하세요
          </p>
        </div>
        
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
      </div>
    </div>
  )
}

export default StudentLogin 