import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { testSupabaseConnection } from '../../lib/supabase'

const AdminLogin: React.FC = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  
  const { dispatch, loginAdmin } = useAttendance()
  const navigate = useNavigate()
  
  // 컴포넌트 마운트 시 Supabase 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      console.log('🔍 관리자 로그인 - Supabase 연결 상태 확인 중...')
      const isConnected = await testSupabaseConnection()
      setSupabaseStatus(isConnected ? 'connected' : 'disconnected')
      
      if (!isConnected) {
        setErrorMessage('⚠️ 데이터베이스 연결에 문제가 있습니다. 새 Supabase 프로젝트를 생성해주세요.')
      }
    }
    
    checkConnection()
  }, [])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Supabase 연결 문제가 있으면 로그인 시도 중단
    if (supabaseStatus === 'disconnected') {
      setErrorMessage('❌ 데이터베이스 연결 문제로 로그인할 수 없습니다.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      console.log('🔐 관리자 로그인 시도:', { phone })
      const success = await loginAdmin(phone, password)
      
      if (success) {
        console.log('✅ 관리자 로그인 성공')
        dispatch({ type: 'ADMIN_LOGIN' })
        navigate('/admin/main')
      } else {
        console.log('❌ 관리자 로그인 실패')
        setErrorMessage('전화번호 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('💥 관리자 로그인 오류:', error)
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
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h1>
          <p className="text-gray-600">출석체크 관리자 시스템에 로그인하세요</p>
        </div>
        
        {/* Supabase 연결 상태 표시 */}
        <div className="mt-4 text-center">
          {supabaseStatus === 'checking' && (
            <div className="text-yellow-600 text-sm">
              🔍 데이터베이스 연결 확인 중...
            </div>
          )}
          {supabaseStatus === 'connected' && (
            <div className="text-green-600 text-sm">
              ✅ 데이터베이스 연결 정상
            </div>
          )}
          {supabaseStatus === 'disconnected' && (
            <div className="text-red-600 text-sm">
              ❌ 데이터베이스 연결 실패
              <br />
              <span className="text-xs">
                Supabase 프로젝트를 확인하거나 새로 생성해주세요
              </span>
            </div>
          )}
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
                <Lock className="h-5 w-5 text-gray-400" />
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
            disabled={isLoading || supabaseStatus === 'disconnected'}
            className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading || supabaseStatus === 'disconnected'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isLoading ? '로그인 중...' : '관리자 로그인'}
          </button>
        </form>
        
        {/* 테스트 계정 안내 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">테스트 계정</h3>
          <p className="text-sm text-blue-700">
            전화번호: 01000000000<br />
            비밀번호: 1234
          </p>
        </div>
        
        {/* 학생 로그인 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            학생이신가요?{' '}
            <button
              onClick={() => navigate('/student')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              학생 로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin 