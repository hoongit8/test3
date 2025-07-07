import { createClient } from '@supabase/supabase-js'

// 🚨 새 Supabase 프로젝트 생성 후 아래 값들을 업데이트하세요!
// 1. https://supabase.com/dashboard 에서 새 프로젝트 생성
// 2. Settings → API 메뉴에서 Project URL과 anon public key 복사
// 3. 아래 값들을 새 프로젝트 정보로 교체

// ⚠️ 현재 URL이 404 오류를 발생시키고 있습니다 - 새 프로젝트 필요!
const supabaseUrl = 'https://pnqoonmbjrxbjpkbwoxg.supabase.co' // 👈 새 Project URL로 교체
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucW9vbm1ianJ4Ympwa2J3b3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjM1OTUsImV4cCI6MjA1MTIzOTU5NX0.KJdGGwJKzVIKUfFYbZYQhJcJfRnfTQrOlKqfKYVqfVs' // 👈 새 anon public key로 교체

// 디버깅을 위한 로그
console.log('🔗 Supabase 설정 확인:')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ Key가 설정되지 않음')

// Supabase 연결 상태 확인
let isSupabaseConnected = false
try {
  // 간단한 연결 테스트 (실제로는 첫 API 호출에서 확인됨)
  console.log('🔄 Supabase 연결 테스트 시작...')
} catch (error) {
  console.error('❌ Supabase 연결 실패:', error)
}

// 환경 변수 상태 확인 (참고용)
console.log('🔍 환경 변수 상태:')
console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ 설정되지 않음')
console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정되지 않음')

// Supabase 클라이언트 생성 (하드코딩된 값 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    console.log('🔄 Supabase 연결 테스트 시작...')
    
    const { error } = await supabase
      .from('students')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase 연결 실패:', error)
      return false
    }
    
    console.log('✅ Supabase 연결 성공')
    return true
  } catch (error) {
    console.error('❌ Supabase 연결 테스트 중 오류:', error)
    return false
  }
}

// 데이터베이스 초기화
export const initializeDatabase = async () => {
  try {
    console.log('🔄 데이터베이스 초기화 시작...')
    
    // 테스트 학생 데이터 삽입
    const { error } = await supabase
      .from('students')
      .upsert([
        { id: '1', name: '김철수', phone: '01012345678', password: '1234' },
        { id: '2', name: '이영희', phone: '01098765432', password: '1234' },
        { id: '3', name: '박민수', phone: '01055557777', password: '1234' }
      ], { onConflict: 'phone' })
    
    if (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error)
      return false
    }
    
    console.log('✅ 데이터베이스 초기화 완료')
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류:', error)
    return false
  }
}

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          join_date: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          join_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          join_date?: string
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          max_students: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          max_students?: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          max_students?: number
          description?: string | null
          created_at?: string
        }
      }
      class_bookings: {
        Row: {
          id: string
          class_id: string
          student_id: string
          booked_at: string
        }
        Insert: {
          id?: string
          class_id: string
          student_id: string
          booked_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          student_id?: string
          booked_at?: string
        }
      }
    }
  }
}

// 타입이 적용된 Supabase 클라이언트
export const typedSupabase = supabase as typeof supabase & {
  from: <T extends keyof Database['public']['Tables']>(table: T) => any
} 