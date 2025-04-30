CREATE TABLE exhibition (
  exhibition_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  posterUrl TEXT,
  category TEXT,
  start_date DATE,
  end_date DATE,
  start_time DATETIME,
  end_time DATETIME,
  location TEXT,
  price INTEGER,
  gallery_id INTEGER,
  tag TEXT,
  status TEXT CHECK(status IN ('scheduled', 'exhibited', 'ended')),
  create_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_dttm DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO exhibition (title, posterUrl, category, start_date, end_date, start_time, end_time, location, price, gallery_id, tag, status)
VALUES
-- 1
('빛의 향연: 한국 현대 사진전', 'https://example.com/posters/photo.jpg', '사진', '2025-05-01', '2025-06-15', '10:00', '18:00', '서울시립미술관', 5000, 'G001', '사진,현대', 'exhibited'),

-- 2
('수묵의 미학', 'https://example.com/posters/ink.jpg', '회화', '2025-06-10', '2025-07-30', '09:30', '17:30', '국립현대미술관 서울관', 8000, 'G002', '수묵화,동양화', 'scheduled'),

-- 3
('디지털 아트와 인공지능', 'https://example.com/posters/aiart.jpg', '미디어아트', '2025-04-01', '2025-05-31', '11:00', '20:00', '부산 현대미술관', 12000, 'G003', 'AI,디지털', 'exhibited'),

-- 4
('청년 작가 10인의 실험', 'https://example.com/posters/young.jpg', '회화', '2025-05-20', '2025-06-20', '10:00', '18:00', '대구 아트스페이스', 4000, 'G004', '청년작가,실험', 'scheduled'),

-- 5
('조각과 공간의 대화', 'https://example.com/posters/sculpture.jpg', '조각', '2025-03-10', '2025-04-30', '10:00', '19:00', '광주문화예술회관', 6000, 'G005', '조각,공간', 'exhibited'),

-- 6
('시간 속의 풍경', 'https://example.com/posters/landscape.jpg', '회화', '2025-02-01', '2025-03-01', '09:00', '18:00', '인천아트센터', 3000, 'G006', '풍경화,자연', 'ended'),

-- 7
('VR 미술체험전', 'https://example.com/posters/vr.jpg', '미디어아트', '2025-04-15', '2025-06-01', '12:00', '20:00', '서울 코엑스', 15000, 'G007', 'VR,체험', 'exhibited'),

-- 8
('모던과 클래식의 경계', 'https://example.com/posters/modern.jpg', '회화', '2025-05-05', '2025-07-01', '10:00', '18:00', '수원미술관', 7000, 'G008', '모던,클래식', 'scheduled'),

-- 9
('도시와 건축', 'https://example.com/posters/architecture.jpg', '건축', '2025-04-01', '2025-05-20', '10:00', '17:00', '서울시청 시민청', 0, 'G009', '도시,건축', 'exhibited'),

-- 10
('모던 아트 서울 2025', 'https://example.com/poster1.jpg', '미술', '2025-05-01', '2025-05-31', '10:00', '18:00', '서울 코엑스', 15000, 1, '현대미술,서울', 'scheduled'),

-- 11
('AI & 테크 엑스포', 'https://example.com/poster2.jpg', '기술', '2025-06-10', '2025-06-13', '09:00', '17:00', '부산 벡스코', 10000, 2, 'AI,기술,박람회', 'scheduled'),

-- 12
('역사 속 시간여행', 'https://example.com/poster3.jpg', '역사', '2025-04-15', '2025-07-15', '10:00', '17:00', '국립중앙박물관', 0, 3, '역사,유물,박물관', 'exhibited');
