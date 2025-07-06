import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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