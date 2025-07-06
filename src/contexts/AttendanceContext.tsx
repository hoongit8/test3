import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { 
  studentService, 
  classService, 
  bookingService, 
  adminService, 
  initializeData 
} from '../services/database'

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

// 초기 상태
const initialState: AttendanceState = {
  adminLoggedIn: false,
  studentLoggedIn: false,
  currentStudent: null,
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

// 리듀서
function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'ADMIN_LOGIN':
      return { ...state, adminLoggedIn: true }
    
    case 'ADMIN_LOGOUT':
      return { ...state, adminLoggedIn: false }
    
    case 'STUDENT_LOGIN':
      return { 
        ...state, 
        studentLoggedIn: true, 
        currentStudent: action.payload 
      }
    
    case 'STUDENT_LOGOUT':
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

// Provider 컴포넌트
export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState)
  
  // 학생 데이터 로드
  const loadStudents = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const students = await studentService.getAll()
      dispatch({ type: 'SET_STUDENTS', payload: students })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '학생 데이터를 불러오는데 실패했습니다.' })
      console.error('학생 데이터 로드 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 수업 데이터 로드
  const loadClasses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const classes = await classService.getAll()
      dispatch({ type: 'SET_CLASSES', payload: classes })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '수업 데이터를 불러오는데 실패했습니다.' })
      console.error('수업 데이터 로드 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
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
      
      const newClass = await classService.create(classData)
      console.log('✅ classService.create 성공:', newClass)
      
      dispatch({ type: 'ADD_CLASS', payload: newClass })
      console.log('📝 Redux 상태 업데이트 완료')
      
      return newClass
      
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
      dispatch({ type: 'SET_LOADING', payload: true })
      await bookingService.create(classId, studentId)
      // 수업 데이터 다시 로드해서 예약 정보 업데이트
      await loadClasses()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '수업 예약에 실패했습니다.' })
      console.error('수업 예약 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 수업 예약 취소
  const cancelBooking = async (classId: string, studentId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await bookingService.delete(classId, studentId)
      // 수업 데이터 다시 로드해서 예약 정보 업데이트
      await loadClasses()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '수업 예약 취소에 실패했습니다.' })
      console.error('수업 예약 취소 실패:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }
  
  // 관리자 로그인
  const loginAdmin = async (phone: string, password: string) => {
    try {
      const result = await adminService.login(phone, password)
      if (result.success) {
        dispatch({ type: 'ADMIN_LOGIN' })
        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || '로그인에 실패했습니다.' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '로그인 중 오류가 발생했습니다.' })
      console.error('관리자 로그인 실패:', error)
      return false
    }
  }
  
  // 학생 로그인
  const loginStudent = async (phone: string, password: string) => {
    try {
      // 학생 비밀번호는 모두 '1234'로 고정
      if (password !== '1234') {
        dispatch({ type: 'SET_ERROR', payload: '비밀번호가 올바르지 않습니다.' })
        return false
      }
      
      const student = await studentService.getByPhone(phone)
      if (student) {
        dispatch({ type: 'STUDENT_LOGIN', payload: student })
        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: '등록되지 않은 학생입니다.' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '로그인 중 오류가 발생했습니다.' })
      console.error('학생 로그인 실패:', error)
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