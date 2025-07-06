// Supabase 연결 테스트 스크립트
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 값 가져오기
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pnqoonmbjrxbjpkbwoxg.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucW9vbm1ianJ4Ympwa2J3b3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTIzMjksImV4cCI6MjA2NzI2ODMyOX0.KKj_RjR9JcBt4Bd1BBpto5RPIoMBxMRvslxKWQ6e1mE'

console.log('🔗 Supabase 연결 테스트 시작...')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n📊 학생 데이터 조회 테스트...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(5)

    if (studentsError) {
      console.error('❌ 학생 데이터 조회 실패:', studentsError.message)
      return false
    }

    console.log('✅ 학생 데이터 조회 성공!')
    console.log('👥 학생 수:', students?.length || 0)
    if (students && students.length > 0) {
      console.log('📋 첫 번째 학생:', students[0].name, students[0].phone)
    }

    console.log('\n📚 수업 데이터 조회 테스트...')
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .limit(5)

    if (classesError) {
      console.error('❌ 수업 데이터 조회 실패:', classesError.message)
      return false
    }

    console.log('✅ 수업 데이터 조회 성공!')
    console.log('📖 수업 수:', classes?.length || 0)
    if (classes && classes.length > 0) {
      console.log('📋 첫 번째 수업:', classes[0].title, classes[0].date)
    }

    console.log('\n🎉 모든 연결 테스트 성공!')
    return true

  } catch (error) {
    console.error('💥 연결 테스트 중 오류 발생:', error.message)
    return false
  }
}

// 테스트 실행
testConnection().then(success => {
  if (success) {
    console.log('\n✨ Supabase 연결이 정상적으로 작동합니다!')
  } else {
    console.log('\n🚨 Supabase 연결에 문제가 있습니다.')
    console.log('\n🔧 해결 방법:')
    console.log('1. 환경 변수 확인 (.env 파일)')
    console.log('2. Supabase 프로젝트 상태 확인')
    console.log('3. API Key 권한 확인')
    console.log('4. 네트워크 연결 확인')
  }
}) 