# 📚 Supabase 연동 설정 가이드

## 🚀 1단계: Supabase 계정 생성 및 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - https://supabase.com 접속
   - "Start your project" 클릭

2. **계정 생성/로그인**
   - GitHub 계정으로 로그인 권장
   - 또는 이메일로 계정 생성

3. **새 프로젝트 생성**
   - "New Project" 클릭
   - Organization 선택 (개인 계정 사용)
   - 프로젝트 이름: `attendance-mobile-app`
   - 데이터베이스 비밀번호: 강력한 비밀번호 설정 (반드시 기록해두세요!)
   - 지역: `Northeast Asia (ap-northeast-1)` 선택 (한국과 가까운 지역)
   - "Create new project" 클릭

## 🗄️ 2단계: 데이터베이스 스키마 생성

1. **SQL Editor 접속**
   - 프로젝트 대시보드에서 왼쪽 메뉴의 "SQL Editor" 클릭

2. **스키마 실행**
   - 프로젝트 루트의 `database-schema.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - "RUN" 버튼 클릭
   - 성공 메시지 확인: "Database schema created successfully!"

3. **테이블 확인**
   - 왼쪽 메뉴의 "Table Editor" 클릭
   - `students`, `classes`, `class_bookings` 테이블이 생성되었는지 확인
   - 각 테이블에 더미 데이터가 들어있는지 확인

## 🔑 3단계: API 키 및 URL 확인

1. **Settings > API 접속**
   - 프로젝트 대시보드에서 왼쪽 메뉴의 "Settings" 클릭
   - "API" 탭 클릭

2. **필요한 정보 복사**
   - `Project URL`: 프로젝트 URL (https://xxx.supabase.co 형태)
   - `anon public`: 익명 공개 키 (eyJ... 형태의 긴 문자열)

## 🔧 4단계: 환경 변수 설정

1. **환경 변수 파일 생성**
   ```bash
   # 프로젝트 루트에 .env 파일 생성
   touch .env
   ```

2. **환경 변수 설정**
   ```env
   # .env 파일에 다음 내용 추가
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_ADMIN_PHONE=01000000000
   VITE_ADMIN_PASSWORD=1234
   ```

   > ⚠️ **중요**: 실제 값으로 교체하세요!
   > - `VITE_SUPABASE_URL`: 2단계에서 복사한 Project URL
   > - `VITE_SUPABASE_ANON_KEY`: 2단계에서 복사한 anon public 키

## 🧪 5단계: 테스트 실행

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **로그인 테스트**
   - **관리자 로그인**: 01000000000 / 1234
   - **학생 로그인**: 01012345678 / 1234 (김철수)

3. **기능 테스트**
   - 관리자: 수업 생성, 수정, 삭제
   - 학생: 수업 예약, 취소
   - 실시간 데이터 동기화 확인

## 🔍 6단계: 데이터 확인

1. **Supabase 대시보드에서 확인**
   - Table Editor에서 실시간으로 데이터 변경 확인
   - 웹앱에서 수업을 생성하면 `classes` 테이블에 즉시 반영
   - 예약하면 `class_bookings` 테이블에 즉시 반영

2. **브라우저 개발자 도구 확인**
   - Network 탭에서 Supabase API 호출 확인
   - Console에서 에러 메시지 확인

## 🛠️ 7단계: 추가 설정 (선택사항)

### Row Level Security (RLS) 세부 설정
현재는 개발 편의를 위해 모든 접근을 허용하고 있습니다. 실제 운영 시에는 더 세밀한 권한 설정이 필요합니다.

### 실시간 구독 설정
```typescript
// 실시간 데이터 구독 예시
const subscription = supabase
  .channel('classes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'classes' },
    (payload) => {
      console.log('실시간 변경:', payload)
      // 데이터 다시 로드
      loadClasses()
    }
  )
  .subscribe()
```

## 🚨 문제 해결

### 자주 발생하는 오류들

1. **환경 변수 인식 안됨**
   - `.env` 파일이 프로젝트 루트에 있는지 확인
   - 개발 서버 재시작 (`npm run dev`)
   - 환경 변수 이름이 `VITE_` 접두사로 시작하는지 확인

2. **데이터베이스 연결 실패**
   - Supabase URL과 API 키가 올바른지 확인
   - 네트워크 연결 상태 확인
   - 브라우저 개발자 도구에서 네트워크 에러 확인

3. **RLS 권한 오류**
   - SQL Editor에서 RLS 정책이 올바르게 설정되었는지 확인
   - 필요시 정책을 다시 생성

4. **테이블 생성 실패**
   - `database-schema.sql` 파일을 단계별로 실행
   - 각 단계에서 에러 메시지 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 브라우저 개발자 도구 Console 탭
2. 브라우저 개발자 도구 Network 탭
3. Supabase 대시보드의 Logs 섹션

---

## 🎉 완료!

모든 설정이 완료되면 다음 기능들을 사용할 수 있습니다:

✅ **실시간 데이터 동기화**: 관리자가 수업을 생성하면 학생 페이지에 즉시 반영  
✅ **영구 데이터 저장**: 페이지 새로고침해도 데이터 유지  
✅ **다중 사용자 지원**: 여러 사용자가 동시에 접속 가능  
✅ **확장 가능한 구조**: 추후 기능 추가 용이  

이제 진짜 데이터베이스 기반 출석체크 시스템을 사용할 수 있습니다! 🚀 