import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { 
  studentService, 
  classService, 
  bookingService, 
  adminService, 
  initializeData 
} from '../services/database'
import { supabase } from '../lib/supabase'

// 타입 정의
interface Student {
  id: string
  name: string
  phone: string
  email: string | null
  join_date: string
  created_at: string
}

interface Class {
  id: string
  title: string
  date: string
  time: string
  max_students: number
  description: string | null
  created_at: string
  class_bookings?: {
    id: string
    student_id: string
    students: {
      id: string
      name: string
      phone: string
    }
  }[]
}

interface AttendanceState {
  // 인증 상태
  adminLoggedIn: boolean
  studentLoggedIn: boolean
  currentStudent: Student | null
  
  // 데이터
  students: Student[]
  classes: Class[]
  
  // UI 상태
  selectedDate: string
  isModalOpen: boolean
  modalType: 'createClass' | 'editClass' | 'studentDetail' | 'addStudent' | null
  selectedClass: Class | null
  selectedStudent: Student | null
  
  // 로딩 상태
  loading: boolean
  error: string | null
}

// 액션 타입
type AttendanceAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'ADMIN_LOGOUT' }
  | { type: 'STUDENT_LOGIN'; payload: Student }
  | { type: 'STUDENT_LOGOUT' }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'OPEN_MODAL'; payload: { type: AttendanceState['modalType']; class?: Class; student?: Student } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_CLASSES'; payload: Class[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_CLASS'; payload: Class }
  | { type: 'UPDATE_CLASS'; payload: Class }
  | { type: 'DELETE_CLASS'; payload: string }

// 초기 상태 - localStorage에서 로그인 상태 복원
const getInitialState = (): AttendanceState => {
  // localStorage에서 로그인 상태 확인
  const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
  const studentLoggedIn = localStorage.getItem('studentLoggedIn') === 'true'
  const currentStudentData = localStorage.getItem('currentStudent')
  
  return {
    adminLoggedIn,
    studentLoggedIn,
    currentStudent: currentStudentData ? JSON.parse(currentStudentData) : null,
    students: [],
    classes: [],
    selectedDate: new Date().toISOString().split('T')[0],
    isModalOpen: false,
    modalType: null,
    selectedClass: null,
    selectedStudent: null,
    loading: false,
    error: null
  }
}

const initialState: AttendanceState = getInitialState()

// 리듀서
function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'ADMIN_LOGIN':
      localStorage.setItem('adminLoggedIn', 'true')
      return { ...state, adminLoggedIn: true }
    
    case 'ADMIN_LOGOUT':
      localStorage.removeItem('adminLoggedIn')
      return { ...state, adminLoggedIn: false }
    
    case 'STUDENT_LOGIN':
      localStorage.setItem('studentLoggedIn', 'true')
      localStorage.setItem('currentStudent', JSON.stringify(action.payload))
      return { 
        ...state, 
        studentLoggedIn: true, 
        currentStudent: action.payload 
      }
    
    case 'STUDENT_LOGOUT':
      localStorage.removeItem('studentLoggedIn')
      localStorage.removeItem('currentStudent')
      return { 
        ...state, 
        studentLoggedIn: false, 
        currentStudent: null 
      }
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'OPEN_MODAL':
      return {
        ...state,
        isModalOpen: true,
        modalType: action.payload.type,
        selectedClass: action.payload.class || null,
        selectedStudent: action.payload.student || null
      }
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        isModalOpen: false,
        modalType: null,
        selectedClass: null,
        selectedStudent: null
      }
    
    case 'SET_STUDENTS':
      return { ...state, students: action.payload }
    
    case 'SET_CLASSES':
      return { ...state, classes: action.payload }
    
    case 'ADD_STUDENT':
      return { 
        ...state, 
        students: [...state.students, action.payload] 
      }
    
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload : student
        )
      }
    
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload)
      }
    
    case 'ADD_CLASS':
      return { 
        ...state, 
        classes: [...state.classes, action.payload] 
      }
    
    case 'UPDATE_CLASS':
      return {
        ...state,
        classes: state.classes.map(cls =>
          cls.id === action.payload.id ? action.payload : cls
        )
      }
    
    case 'DELETE_CLASS':
      return {
        ...state,
        classes: state.classes.filter(cls => cls.id !== action.payload)
      }
    
    default:
      return state
  }
}

// Context 생성
const AttendanceContext = createContext<{
  state: AttendanceState
  dispatch: React.Dispatch<AttendanceAction>
  // 데이터베이스 액션들
  loadStudents: () => Promise<void>
  loadClasses: () => Promise<void>
  createStudent: (student: { name: string; phone: string; email?: string }) => Promise<void>
  updateStudent: (id: string, updates: { name?: string; phone?: string; email?: string }) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  createClass: (classData: { title: string; date: string; time: string; max_students?: number; description?: string }) => Promise<void>
  updateClass: (id: string, updates: { title?: string; date?: string; time?: string; max_students?: number; description?: string }) => Promise<void>
  deleteClass: (id: string) => Promise<void>
  bookClass: (classId: string, studentId: string) => Promise<void>
  cancelBooking: (classId: string, studentId: string) => Promise<void>
  loginAdmin: (phone: string, password: string) => Promise<boolean>
  loginStudent: (phone: string, password: string) => Promise<boolean>
  initializeDatabase: () => Promise<void>
} | null>(null)

// Mock 데이터 (Supabase 연결 실패 시 사용)
const mockStudents = [
  { id: '1', name: '김철수', phone: '01012345678', email: 'kim@example.com', join_date: '2024-01-01', created_at: '2024-01-01' },
  { id: '2', name: '박영희', phone: '01098765432', email: 'park@example.com', join_date: '2024-01-01', created_at: '2024-01-01' },
  { id: '3', name: '이민수', phone: '01055557777', email: 'lee@example.com', join_date: '2024-01-01', created_at: '2024-01-01' }
]

// 현재 날짜 가져오기
const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const mockClasses = [
  { 
    id: '1', 
    title: '오전 요가', 
    date: todayStr, 
    time: '09:00', 
    max_students: 5, 
    description: '요가 수업', 
    created_at: new Date().toISOString(),
    class_bookings: [
      {
        id: 'booking1',
        student_id: '1',
        students: { id: '1', name: '김철수', phone: '01012345678' }
      },
      {
        id: 'booking2',
        student_id: '2',
        students: { id: '2', name: '박영희', phone: '01098765432' }
      }
    ]
  },
  { 
    id: '2', 
    title: '오후 필라테스', 
    date: todayStr, 
    time: '14:00', 
    max_students: 4, 
    description: '필라테스 수업', 
    created_at: new Date().toISOString(),
    class_bookings: [
      {
        id: 'booking3',
        student_id: '3',
        students: { id: '3', name: '이민수', phone: '01055557777' }
      }
    ]
  },
  { 
    id: '3', 
    title: '저녁 스트레칭', 
    date: tomorrowStr, 
    time: '19:00', 
    max_students: 3, 
    description: '하루 마무리 스트레칭', 
    created_at: new Date().toISOString(),
    class_bookings: []
  }
]

const mockAdmins = [
  { id: '1', phone: '01000000000', password: '1234', created_at: '2024-01-01' }
]

// Supabase 연결 확인 함수
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('students').select('count').limit(1)
    return !error
  } catch (error) {
    console.warn('⚠️ Supabase 연결 실패, Mock 데이터 사용:', error)
    return false
  }
}

// Provider 컴포넌트
export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState)
  
  // 학생 데이터 로드
  const loadStudents = async () => {
    try {
      console.log('👥 학생 목록 로드 시도')
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        const students = await studentService.getAll()
        dispatch({ type: 'SET_STUDENTS', payload: students })
        console.log('✅ 학생 목록 로드 성공 (Supabase):', students)
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 학생 목록 로드')
        dispatch({ type: 'SET_STUDENTS', payload: mockStudents })
        console.log('✅ 학생 목록 로드 성공 (Mock):', mockStudents)
      }
    } catch (error) {
      console.error('💥 학생 목록 로드 오류:', error)
    }
  }
  
  // 수업 데이터 로드
  const loadClasses = async () => {
    try {
      console.log('📚 수업 목록 로드 시도')
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        const classes = await classService.getAll()
        dispatch({ type: 'SET_CLASSES', payload: classes })
        console.log('✅ 수업 목록 로드 성공 (Supabase):', classes)
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 수업 목록 로드')
        dispatch({ type: 'SET_CLASSES', payload: mockClasses })
        console.log('✅ 수업 목록 로드 성공 (Mock):', mockClasses)
      }
    } catch (error) {
      console.error('💥 수업 목록 로드 오류:', error)
    }
  }
  
  // 학생 생성
  const createStudent = async (studentData: { name: string; phone: string; email?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const newStudent = await studentService.create(studentData)
      dispatch({ type: 'ADD_STUDENT', payload: newStudent })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '학생 생성에 실패했습니다.' })
      console.error('학생 생성 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 학생 정보 수정
  const updateStudent = async (id: string, updates: { name?: string; phone?: string; email?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedStudent = await studentService.update(id, updates)
      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '학생 정보 수정에 실패했습니다.' })
      console.error('학생 정보 수정 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 학생 삭제
  const deleteStudent = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await studentService.delete(id)
      dispatch({ type: 'DELETE_STUDENT', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '학생 삭제에 실패했습니다.' })
      console.error('학생 삭제 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 수업 생성
  const createClass = async (classData: { title: string; date: string; time: string; max_students?: number; description?: string }) => {
    console.log('🏗️ Context createClass 시작')
    console.log('📋 받은 데이터:', classData)
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      console.log('⏳ 로딩 상태 설정')
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        const newClass = await classService.create(classData)
        console.log('✅ classService.create 성공:', newClass)
        
        dispatch({ type: 'ADD_CLASS', payload: newClass })
        console.log('📝 Redux 상태 업데이트 완료')
        
        return newClass
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 수업 생성')
        const newClass = {
          id: Date.now().toString(),
          title: classData.title,
          date: classData.date,
          time: classData.time,
          max_students: classData.max_students || 5,
          description: classData.description || null,
          created_at: new Date().toISOString(),
          class_bookings: [] // 새 수업은 예약자가 없음
        }
        
        dispatch({ type: 'ADD_CLASS', payload: newClass })
        console.log('✅ 수업 생성 성공 (Mock):', newClass)
        return newClass
      }
      
    } catch (error) {
      console.error('❌ Context createClass 실패:', error)
      dispatch({ type: 'SET_ERROR', payload: '수업 생성에 실패했습니다.' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      console.log('🏁 로딩 상태 해제')
    }
  }
  
  // 수업 정보 수정
  const updateClass = async (id: string, updates: { title?: string; date?: string; time?: string; max_students?: number; description?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedClass = await classService.update(id, updates)
      dispatch({ type: 'UPDATE_CLASS', payload: updatedClass })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '수업 정보 수정에 실패했습니다.' })
      console.error('수업 정보 수정 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 수업 삭제
  const deleteClass = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await classService.delete(id)
      dispatch({ type: 'DELETE_CLASS', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '수업 삭제에 실패했습니다.' })
      console.error('수업 삭제 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 수업 예약
  const bookClass = async (classId: string, studentId: string) => {
    try {
      console.log('📝 수업 예약 시도:', { classId, studentId })
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        await bookingService.create(classId, studentId)
        // 수업 데이터 다시 로드해서 예약 정보 업데이트
        await loadClasses()
        console.log('✅ 수업 예약 성공 (Supabase)')
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 수업 예약')
        
        // 현재 수업 찾기
        const currentClass = state.classes.find(cls => cls.id === classId)
        const student = mockStudents.find(s => s.id === studentId)
        
        if (!currentClass || !student) {
          throw new Error('수업 또는 학생 정보를 찾을 수 없습니다.')
        }
        
        // 이미 예약했는지 확인
        const isAlreadyBooked = currentClass.class_bookings?.some(booking => 
          booking.student_id === studentId
        )
        
        if (isAlreadyBooked) {
          throw new Error('이미 예약된 수업입니다.')
        }
        
        // 정원 확인
        const currentBookings = currentClass.class_bookings?.length || 0
        if (currentBookings >= currentClass.max_students) {
          throw new Error('수업 정원이 초과되었습니다.')
        }
        
        // 예약 추가
        const newBooking = {
          id: `booking_${Date.now()}`,
          student_id: studentId,
          students: { 
            id: student.id, 
            name: student.name, 
            phone: student.phone 
          }
        }
        
        const updatedClass = {
          ...currentClass,
          class_bookings: [...(currentClass.class_bookings || []), newBooking]
        }
        
        dispatch({ type: 'UPDATE_CLASS', payload: updatedClass })
        console.log('✅ 수업 예약 성공 (Mock):', newBooking)
      }
    } catch (error) {
      console.error('❌ 수업 예약 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '수업 예약에 실패했습니다.'
      alert(errorMessage)
    }
  }
  
  // 수업 예약 취소
  const cancelBooking = async (classId: string, studentId: string) => {
    try {
      console.log('❌ 수업 예약 취소 시도:', { classId, studentId })
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        await bookingService.delete(classId, studentId)
        // 수업 데이터 다시 로드해서 예약 정보 업데이트
        await loadClasses()
        console.log('✅ 수업 예약 취소 성공 (Supabase)')
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 수업 예약 취소')
        
        // 현재 수업 찾기
        const currentClass = state.classes.find(cls => cls.id === classId)
        
        if (!currentClass) {
          throw new Error('수업 정보를 찾을 수 없습니다.')
        }
        
        // 예약 정보에서 해당 학생 제거
        const updatedBookings = currentClass.class_bookings?.filter(booking => 
          booking.student_id !== studentId
        ) || []
        
        const updatedClass = {
          ...currentClass,
          class_bookings: updatedBookings
        }
        
        dispatch({ type: 'UPDATE_CLASS', payload: updatedClass })
        console.log('✅ 수업 예약 취소 성공 (Mock)')
      }
    } catch (error) {
      console.error('❌ 수업 예약 취소 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '수업 예약 취소에 실패했습니다.'
      alert(errorMessage)
    }
  }
  
  // 관리자 로그인
  const loginAdmin = async (phone: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 관리자 로그인 시도:', { phone })
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('phone', phone)
          .eq('password', password)
          .single()

        if (error) {
          console.error('❌ 관리자 로그인 실패:', error.message)
          return false
        }

        console.log('✅ 관리자 로그인 성공 (Supabase)')
        dispatch({ type: 'ADMIN_LOGIN' })
        return true
      } else {
        // Mock 데이터 사용
        console.log('🔄 Mock 데이터로 관리자 로그인 확인')
        const admin = mockAdmins.find(a => a.phone === phone && a.password === password)
        
        if (admin) {
          console.log('✅ 관리자 로그인 성공 (Mock)')
          dispatch({ type: 'ADMIN_LOGIN' })
          return true
        } else {
          console.log('❌ 관리자 로그인 실패 (Mock)')
          return false
        }
      }
    } catch (error) {
      console.error('💥 관리자 로그인 오류:', error)
      return false
    }
  }
  
  // 학생 로그인
  const loginStudent = async (phone: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 학생 로그인 시도:', { phone })
      
      // Supabase 연결 확인
      const isConnected = await checkSupabaseConnection()
      
      if (isConnected) {
        // Supabase 사용
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('phone', phone)
          .single()

        if (error) {
          console.error('❌ 학생 로그인 실패:', error.message)
          return false
        }

                 // 학생 정보 저장
         dispatch({ type: 'STUDENT_LOGIN', payload: data })
         console.log('✅ 학생 로그인 성공 (Supabase):', data)
        return true
      } else {
        // Mock 데이터 사용 (비밀번호는 1234로 고정)
        console.log('🔄 Mock 데이터로 학생 로그인 확인')
        if (password !== '1234') {
          console.log('❌ 학생 로그인 실패 - 잘못된 비밀번호 (Mock)')
          return false
        }
        
        const student = mockStudents.find(s => s.phone === phone)
        
                 if (student) {
           dispatch({ type: 'STUDENT_LOGIN', payload: student })
           console.log('✅ 학생 로그인 성공 (Mock):', student)
          return true
        } else {
          console.log('❌ 학생 로그인 실패 - 학생 정보 없음 (Mock)')
          return false
        }
      }
    } catch (error) {
      console.error('💥 학생 로그인 오류:', error)
      return false
    }
  }
  
  // 데이터베이스 초기화
  const initializeDatabase = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await initializeData()
      // 초기화 후 데이터 다시 로드
      await loadStudents()
      await loadClasses()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '데이터베이스 초기화에 실패했습니다.' })
      console.error('데이터베이스 초기화 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadStudents()
    loadClasses()
  }, [])
  
  return (
    <AttendanceContext.Provider value={{ 
      state, 
      dispatch,
      loadStudents,
      loadClasses,
      createStudent,
      updateStudent,
      deleteStudent,
      createClass,
      updateClass,
      deleteClass,
      bookClass,
      cancelBooking,
      loginAdmin,
      loginStudent,
      initializeDatabase
    }}>
      {children}
    </AttendanceContext.Provider>
  )
}

// 커스텀 훅
export function useAttendance() {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return context
} 