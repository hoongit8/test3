import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 값 가져오기 (기본값 포함)
// Vercel 환경 변수 문제 해결을 위해 하드코딩된 값을 우선 사용
const supabaseUrl = 'https://pnqoonmbjrxbjpkbwoxg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucW9vbm1ianJ4Ympwa2J3b3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTIzMjksImV4cCI6MjA2NzI2ODMyOX0.KKj_RjR9JcBt4Bd1BBpto5RPIoMBxMRvslxKWQ6e1mE'

// 디버깅을 위한 로그
console.log('🔗 Supabase 설정 확인:')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ Key가 설정되지 않음')

// 환경 변수 상태 확인 (참고용)
console.log('🔍 환경 변수 상태:')
console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ 설정되지 않음')
console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정되지 않음')

// Supabase 클라이언트 생성 (하드코딩된 값 사용)
export const supabase = createClient(supabaseUrl, supabaseKey)

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