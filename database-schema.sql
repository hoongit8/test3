-- 출석체크 모바일 앱 데이터베이스 스키마
-- Supabase PostgreSQL 기반

-- 1. 학생 테이블
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 수업 테이블
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    max_students INTEGER DEFAULT 5 CHECK (max_students > 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 수업 예약 테이블
CREATE TABLE IF NOT EXISTS class_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    booked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(date);
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_id ON class_bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_student_id ON class_bookings(student_id);

-- 5. Row Level Security (RLS) 설정
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 생성 (모든 사용자가 읽기/쓰기 가능 - 개발용)
-- 실제 운영에서는 더 세밀한 권한 설정이 필요합니다
CREATE POLICY "Allow all operations on students" ON students
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on classes" ON classes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on class_bookings" ON class_bookings
    FOR ALL USING (true) WITH CHECK (true);

-- 7. 초기 더미 데이터 삽입
INSERT INTO students (name, phone, email) VALUES
    ('김철수', '01012345678', 'chulsoo@example.com'),
    ('박영희', '01098765432', 'younghee@example.com'),
    ('이민수', '01055557777', 'minsu@example.com')
ON CONFLICT (phone) DO NOTHING;

-- 8. 수업 더미 데이터 삽입
INSERT INTO classes (title, date, time, max_students, description) VALUES
    ('기초 수학', '2024-01-15', '10:00', 5, '기초적인 수학 개념을 다룹니다.'),
    ('영어 회화', '2024-01-16', '14:00', 4, '일상 영어 회화 연습'),
    ('과학 실험', '2024-01-17', '15:00', 6, '재미있는 과학 실험 수업')
ON CONFLICT DO NOTHING;

-- 9. 초기 예약 데이터 삽입 (실제 운영에서는 제거)
-- 이 부분은 초기 테스트용이므로 실제 운영 시에는 삭제하세요
DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    class1_id UUID;
    class2_id UUID;
    class3_id UUID;
BEGIN
    -- 학생 ID 조회
    SELECT id INTO student1_id FROM students WHERE phone = '01012345678';
    SELECT id INTO student2_id FROM students WHERE phone = '01098765432';
    SELECT id INTO student3_id FROM students WHERE phone = '01055557777';
    
    -- 수업 ID 조회
    SELECT id INTO class1_id FROM classes WHERE title = '기초 수학';
    SELECT id INTO class2_id FROM classes WHERE title = '영어 회화';
    SELECT id INTO class3_id FROM classes WHERE title = '과학 실험';
    
    -- 예약 데이터 삽입
    INSERT INTO class_bookings (class_id, student_id) VALUES
        (class1_id, student1_id),
        (class1_id, student2_id),
        (class2_id, student3_id),
        (class3_id, student1_id),
        (class3_id, student2_id),
        (class3_id, student3_id)
    ON CONFLICT DO NOTHING;
END $$;

-- 10. 유용한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW class_with_bookings AS
SELECT 
    c.*,
    COUNT(cb.id) as current_students,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'id', s.id,
            'name', s.name,
            'phone', s.phone
        )
    ) FILTER (WHERE s.id IS NOT NULL) as enrolled_students
FROM classes c
LEFT JOIN class_bookings cb ON c.id = cb.class_id
LEFT JOIN students s ON cb.student_id = s.id
GROUP BY c.id, c.title, c.date, c.time, c.max_students, c.description, c.created_at;

-- 11. 데이터베이스 함수 생성 (선택사항)
-- 수업 예약 가능 여부 확인 함수
CREATE OR REPLACE FUNCTION can_book_class(p_class_id UUID, p_student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_count INTEGER;
    already_booked BOOLEAN;
BEGIN
    -- 이미 예약했는지 확인
    SELECT EXISTS(
        SELECT 1 FROM class_bookings 
        WHERE class_id = p_class_id AND student_id = p_student_id
    ) INTO already_booked;
    
    IF already_booked THEN
        RETURN FALSE;
    END IF;
    
    -- 현재 예약 수와 최대 수강 인원 확인
    SELECT COUNT(*), c.max_students
    INTO current_count, max_count
    FROM class_bookings cb
    JOIN classes c ON c.id = p_class_id
    WHERE cb.class_id = p_class_id
    GROUP BY c.max_students;
    
    -- 예약 가능 여부 반환
    RETURN COALESCE(current_count, 0) < max_count;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
SELECT 'Database schema created successfully!' as message; 