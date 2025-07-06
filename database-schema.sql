-- 출석관리 앱 데이터베이스 스키마
-- 새 Supabase 프로젝트에서 SQL Editor에 복사해서 실행하세요

-- 1. 학생 테이블 생성
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 수업 테이블 생성
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_students INTEGER DEFAULT 5,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 수업 예약 테이블 생성
CREATE TABLE IF NOT EXISTS class_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 4. 관리자 테이블 생성
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 샘플 데이터 삽입
-- 관리자 계정 (비밀번호: 1234)
INSERT INTO admins (phone, password) VALUES 
('01000000000', '1234')
ON CONFLICT (phone) DO NOTHING;

-- 학생 계정들 (모두 비밀번호: 1234)
INSERT INTO students (name, phone, email) VALUES 
('김철수', '01012345678', 'kim@example.com'),
('박영희', '01098765432', 'park@example.com'),
('이민수', '01055557777', 'lee@example.com'),
('최지영', '01044443333', 'choi@example.com'),
('정현우', '01033332222', 'jung@example.com')
ON CONFLICT (phone) DO NOTHING;

-- 샘플 수업 데이터
INSERT INTO classes (title, date, time, max_students, description) VALUES 
('오전 요가 클래스', CURRENT_DATE + INTERVAL '1 day', '09:00', 5, '초보자를 위한 요가 수업'),
('오후 필라테스', CURRENT_DATE + INTERVAL '1 day', '14:00', 4, '코어 강화 필라테스'),
('저녁 스트레칭', CURRENT_DATE + INTERVAL '2 days', '19:00', 6, '하루 마무리 스트레칭')
ON CONFLICT DO NOTHING;

-- 6. RLS (Row Level Security) 설정
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 7. 공개 읽기 정책 (인증 없이도 읽기 가능)
CREATE POLICY "Public read access" ON students FOR SELECT USING (true);
CREATE POLICY "Public read access" ON classes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON class_bookings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON admins FOR SELECT USING (true);

-- 8. 공개 쓰기 정책 (인증 없이도 쓰기 가능 - 데모용)
CREATE POLICY "Public write access" ON students FOR ALL USING (true);
CREATE POLICY "Public write access" ON classes FOR ALL USING (true);
CREATE POLICY "Public write access" ON class_bookings FOR ALL USING (true);
CREATE POLICY "Public write access" ON admins FOR ALL USING (true);

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(date);
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_id ON class_bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_student_id ON class_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);

-- 완료 메시지
SELECT 'Database schema created successfully!' as message; 