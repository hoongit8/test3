# 출석관리 웹앱 📚

React + TypeScript + Supabase로 구축된 모바일 친화적인 출석관리 시스템입니다.

## 🎯 프로젝트 특징

- **모바일 전용 디자인**: 스마트폰에 최적화된 반응형 UI
- **더미 데이터 기반**: 실제 백엔드 없이 완전한 UX 시연 가능
- **관리자/학생 분리**: 각각의 전용 인터페이스 제공
- **실시간 상태 관리**: Context API를 활용한 상태 관리
- **완전한 CRUD**: 수업 생성, 수정, 삭제 및 학생 관리

## 🚀 빠른 시작

### 1. 프로젝트 설치 및 실행

```bash
# 1. 프로젝트 폴더로 이동
cd attendance-mobile-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

### 2. 브라우저에서 확인

개발 서버가 실행되면 자동으로 브라우저에서 `http://localhost:3000`이 열립니다.

## 📱 사용 방법

### 관리자 (선생님) 모드

1. **로그인**: 메인 페이지에서 관리자 로그인 선택
   - 전화번호: `01000000000`
   - 비밀번호: `1234`

2. **수업 관리**: 
   - 달력에서 날짜 클릭 → 수업 생성
   - 기존 수업 수정/삭제
   - 실시간 참여 학생 수 확인

3. **학생 관리**:
   - 상단 학생 아이콘 클릭
   - 학생 추가/수정/삭제
   - 학생별 참여 수업 현황 확인

### 학생 모드

1. **로그인**: 학생 로그인 선택
   - 김철수: `01012345678`
   - 박영희: `01098765432`
   - 이민수: `01055557777`
   - 공통 비밀번호: `1234`

2. **수업 예약**:
   - 달력에서 원하는 날짜 선택
   - 예약 가능한 수업 목록 확인
   - 수업 예약 및 취소

3. **내 수업 관리**:
   - 참여 중인 수업 현황 확인
   - 수업 취소 기능

## 🗂️ 프로젝트 구조

```
src/
├── components/          # 공통 컴포넌트
│   ├── Calendar.tsx    # 달력 컴포넌트
│   └── Modal.tsx       # 모달 컴포넌트
├── contexts/           # 상태 관리
│   └── AttendanceContext.tsx
├── pages/              # 페이지 컴포넌트
│   ├── admin/          # 관리자 페이지
│   │   ├── AdminLogin.tsx
│   │   ├── AdminMain.tsx
│   │   └── AdminMembers.tsx
│   └── student/        # 학생 페이지
│       ├── StudentLogin.tsx
│       └── StudentMain.tsx
├── App.tsx             # 메인 앱 컴포넌트
├── main.tsx            # 앱 진입점
└── index.css           # 전역 스타일
```

## 🎨 주요 기능

### 📅 달력 기능
- 월별 달력 표시
- 수업 정보 표시
- 날짜별 수업 개수 확인
- 관리자: 수업 생성 버튼
- 학생: 내 수업만 하이라이트

### 🏫 관리자 기능
- **수업 관리**: 생성, 수정, 삭제
- **학생 관리**: 학생 정보 관리
- **대시보드**: 수업 현황 확인

### 🎓 학생 기능
- **수업 예약**: 원하는 수업 예약
- **내 수업**: 참여 중인 수업 확인
- **수업 취소**: 예약 취소

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Routing**: React Router

## 📂 더미 데이터

### 학생 데이터
- 김철수 (01012345678)
- 박영희 (01098765432)
- 이민수 (01055557777)

### 수업 데이터
- 기초 수학 (1월 15일, 10:00)
- 영어 회화 (1월 16일, 14:00)
- 과학 실험 (1월 17일, 15:00)

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# 미리보기 서버 실행
npm run preview
```

## 📱 모바일 최적화

- **터치 친화적 UI**: 버튼과 입력 필드 크기 최적화
- **스크롤 최적화**: 부드러운 스크롤 경험
- **반응형 디자인**: 다양한 화면 크기 지원
- **모바일 네비게이션**: 직관적인 페이지 간 이동

## 🚨 주의사항

- 이 프로젝트는 **UI/UX 시연용**입니다
- 실제 데이터베이스나 백엔드 연결은 없습니다
- 브라우저를 새로고침하면 데이터가 초기화됩니다
- 모든 데이터는 메모리에서만 관리됩니다

## 📞 문의사항

프로젝트 관련 문의사항이 있으시면 GitHub Issues를 통해 연락주세요.

## 🌐 배포

이 프로젝트는 Vercel, Netlify 등의 플랫폼에서 쉽게 배포할 수 있습니다.

### 환경 변수 설정

배포 시 다음 환경 변수를 설정해야 합니다:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

**개발 완료일**: 2024년 1월  
**개발자**: AI Assistant  
**라이선스**: MIT
