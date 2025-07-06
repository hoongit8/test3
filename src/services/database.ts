import { supabase } from '../lib/supabase'

// 학생 관련 서비스
export const studentService = {
  // 모든 학생 조회
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 전화번호로 학생 조회 (로그인용)
  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116은 "not found" 에러
    return data
  },

  // 학생 생성
  async create(student: { name: string; phone: string; email?: string }) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 학생 정보 수정
  async update(id: string, updates: { name?: string; phone?: string; email?: string }) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 학생 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 수업 관련 서비스
export const classService = {
  // 모든 수업 조회 (예약 정보 포함)
  async getAll() {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        class_bookings (
          id,
          student_id,
          students (
            id,
            name,
            phone
          )
        )
      `)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // 특정 날짜의 수업 조회
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        class_bookings (
          id,
          student_id,
          students (
            id,
            name,
            phone
          )
        )
      `)
      .eq('date', date)
      .order('time', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // 수업 생성
  async create(classData: {
    title: string
    date: string
    time: string
    max_students?: number
    description?: string
  }) {
    console.log('🗄️ Database classService.create 시작')
    console.log('📋 받은 데이터:', classData)
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single()
      
      console.log('🔍 Supabase 응답:', { data, error })
      
      if (error) {
        console.error('❌ Supabase 오류:', error)
        throw error
      }
      
      console.log('✅ Database 수업 생성 성공:', data)
      return data
      
    } catch (error) {
      console.error('💥 Database 수업 생성 실패:', error)
      throw error
    }
  },

  // 수업 정보 수정
  async update(id: string, updates: {
    title?: string
    date?: string
    time?: string
    max_students?: number
    description?: string
  }) {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 수업 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 수업 예약 관련 서비스
export const bookingService = {
  // 수업 예약
  async create(classId: string, studentId: string) {
    // 먼저 중복 예약 확인
    const { data: existing } = await supabase
      .from('class_bookings')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single()
    
    if (existing) {
      throw new Error('이미 예약된 수업입니다.')
    }
    
    // 수업 정원 확인
    const { data: classData } = await supabase
      .from('classes')
      .select('max_students, class_bookings(id)')
      .eq('id', classId)
      .single()
    
    if (classData && classData.class_bookings.length >= classData.max_students) {
      throw new Error('수업 정원이 초과되었습니다.')
    }
    
    // 예약 생성
    const { data, error } = await supabase
      .from('class_bookings')
      .insert([{ class_id: classId, student_id: studentId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 수업 예약 취소
  async delete(classId: string, studentId: string) {
    const { error } = await supabase
      .from('class_bookings')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId)
    
    if (error) throw error
  },

  // 학생의 모든 예약 조회
  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('class_bookings')
      .select(`
        *,
        classes (
          id,
          title,
          date,
          time,
          description
        )
      `)
      .eq('student_id', studentId)
      .order('booked_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// 관리자 인증 서비스
export const adminService = {
  // 관리자 로그인 (환경 변수 기반)
  async login(phone: string, password: string) {
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE || '01000000000'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '1234'
    
    if (phone === adminPhone && password === adminPassword) {
      return { success: true, role: 'admin' }
    }
    
    return { success: false, message: '관리자 정보가 올바르지 않습니다.' }
  }
}

// 초기 더미 데이터 생성 함수
export const initializeData = async () => {
  try {
    // 기존 데이터 확인
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .limit(1)
    
    if (existingStudents && existingStudents.length > 0) {
      console.log('초기 데이터가 이미 존재합니다.')
      return
    }
    
    // 학생 데이터 생성
    const studentsData = [
      {
        name: '김철수',
        phone: '01012345678',
        email: 'chulsoo@example.com'
      },
      {
        name: '박영희',
        phone: '01098765432',
        email: 'younghee@example.com'
      },
      {
        name: '이민수',
        phone: '01055557777',
        email: 'minsu@example.com'
      }
    ]
    
    const { data: students, error: studentError } = await supabase
      .from('students')
      .insert(studentsData)
      .select()
    
    if (studentError) throw studentError
    
    // 수업 데이터 생성
    const classesData = [
      {
        title: '기초 수학',
        date: '2024-01-15',
        time: '10:00',
        max_students: 5,
        description: '기초적인 수학 개념을 다룹니다.'
      },
      {
        title: '영어 회화',
        date: '2024-01-16',
        time: '14:00',
        max_students: 4,
        description: '일상 영어 회화 연습'
      },
      {
        title: '과학 실험',
        date: '2024-01-17',
        time: '15:00',
        max_students: 6,
        description: '재미있는 과학 실험 수업'
      }
    ]
    
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .insert(classesData)
      .select()
    
    if (classError) throw classError
    
    // 초기 예약 데이터 생성
    if (students && classes) {
      const bookingsData = [
        { class_id: classes[0].id, student_id: students[0].id },
        { class_id: classes[0].id, student_id: students[1].id },
        { class_id: classes[1].id, student_id: students[2].id },
        { class_id: classes[2].id, student_id: students[0].id },
        { class_id: classes[2].id, student_id: students[1].id },
        { class_id: classes[2].id, student_id: students[2].id }
      ]
      
      const { error: bookingError } = await supabase
        .from('class_bookings')
        .insert(bookingsData)
      
      if (bookingError) throw bookingError
    }
    
    console.log('초기 데이터 생성 완료!')
  } catch (error) {
    console.error('초기 데이터 생성 실패:', error)
  }
} 