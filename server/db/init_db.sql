PRAGMA foreign_keys = ON;



CREATE TABLE gallery (
  gallery_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  imageUrl TEXT,
  address TEXT,
  start_time TIME,
  end_time TIME,
  closed_day TEXT,
  category TEXT,
  description TEXT,
  create_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_dttm DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gallery (name, imageUrl, address, start_time, end_time, closed_day, category, description)
VALUES
('서울시립미술관', 'https://example.com/gallery/sema.jpg', '서울 중구 덕수궁길 61', '10:00', '18:00', '월요일', '공립미술관', '서울 대표 공공 미술관으로 현대미술 전시 중심'),
('국립현대미술관 서울관', 'https://example.com/gallery/mmca.jpg', '서울 종로구 삼청로 30', '10:00', '18:00', '월요일', '국립미술관', '다양한 현대미술 소장 및 전시를 선보이는 국립기관'),
('부산 현대미술관', 'https://example.com/gallery/busan.jpg', '부산 사하구 낙동남로 1191', '10:00', '18:00', '월요일', '공립미술관', '자연과 조화를 이루는 현대미술관'),
('대구 아트스페이스', 'https://example.com/gallery/daegu.jpg', '대구 중구 봉산문화길 58', '11:00', '19:00', '월요일', '복합문화공간', '청년 작가와 실험적 전시를 지향하는 공간'),
('광주문화예술회관', 'https://example.com/gallery/gwangju.jpg', '광주 북구 북문대로 60', '10:00', '19:00', '월요일', '복합문화공간', '조각, 설치미술 중심 전시와 공연'),
('인천아트센터', 'https://example.com/gallery/incheon.jpg', '인천 연수구 송도문화로 123', '09:00', '18:00', '월요일', '공립미술관', '풍경화와 자연주의 미술 전시'),
('수원미술관', 'https://example.com/gallery/suwon.jpg', '경기 수원시 팔달구 인계로 56', '10:00', '18:00', '월요일', '공립미술관', '모던과 클래식 미술의 경계 전시'),
('서울 코엑스', 'https://example.com/gallery/coex.jpg', '서울 강남구 영동대로 513', '10:00', '21:00', '연중무휴', '전시장', 'VR 체험전과 대형 박람회 개최지'),
('부산 벡스코', 'https://example.com/gallery/bexco.jpg', '부산 해운대구 APEC로 55', '09:00', '18:00', '연중무휴', '전시장', 'AI, 테크 전시회가 열리는 국제 전시장'),
('국립중앙박물관', 'https://example.com/gallery/nmkr.jpg', '서울 용산구 서빙고로 137', '10:00', '18:00', '월요일', '국립박물관', '역사와 문화유산 전시 중심');



CREATE TABLE artist (
  artist_id INTEGER PRIMARY KEY AUTOINCREMENT,
  imageUrl TEXT,
  name TEXT NOT NULL,
  category TEXT,
  nation TEXT,
  description TEXT,
  create_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_dttm DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO artist (imageUrl, name, category, nation, description)
VALUES
('https://example.com/artist/kim.jpg', '김영호', '사진', '대한민국', '빛과 그림자를 활용한 현대 사진작가'),
('https://example.com/artist/lee.jpg', '이수진', '회화', '대한민국', '수묵화와 동양화 분야의 대표적 여성 작가'),
('https://example.com/artist/choi.jpg', '최민석', '미디어아트', '대한민국', 'AI와 디지털 기술을 접목한 미디어 아트 작가'),
('https://example.com/artist/jang.jpg', '장은경', '회화', '대한민국', '청년 작가로 실험적 추상화 작업 활발'),
('https://example.com/artist/park.jpg', '박상우', '조각', '대한민국', '공간과 조각의 상호작용을 탐구하는 조각가'),
('https://example.com/artist/oh.jpg', '오지현', '풍경화', '대한민국', '한국 자연과 사계를 담은 풍경화 작가'),
('https://example.com/artist/jung.jpg', '정민아', 'VR아트', '대한민국', 'VR 기반의 인터랙티브 미디어 작가'),
('https://example.com/artist/seo.jpg', '서지훈', '현대미술', '대한민국', '모던과 클래식의 융합을 시도하는 현대미술 작가'),
('https://example.com/artist/yang.jpg', '양은철', '건축', '대한민국', '도시와 건축적 미학을 표현하는 설치미술가'),
('https://example.com/artist/bae.jpg', '배현정', '역사미술', '대한민국', '역사와 문화유산을 재해석한 현대미술 작가');



CREATE TABLE exhibition (
  exhibition_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  posterUrl TEXT,
  category TEXT,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
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
('빛의 향연: 한국 현대 사진전', 'https://example.com/posters/photo.jpg', '사진', '2025-05-01', '2025-06-15', '10:00', '18:00', '서울시립미술관', 5000, 1, '사진,현대', 'exhibited'),

-- 2
('수묵의 미학', 'https://example.com/posters/ink.jpg', '회화', '2025-06-10', '2025-07-30', '09:30', '17:30', '국립현대미술관 서울관', 8000, 2, '수묵화,동양화', 'scheduled'),

-- 3
('디지털 아트와 인공지능', 'https://example.com/posters/aiart.jpg', '미디어아트', '2025-04-01', '2025-05-31', '11:00', '20:00', '부산 현대미술관', 12000, 3, 'AI,디지털', 'exhibited'),

-- 4
('청년 작가 10인의 실험', 'https://example.com/posters/young.jpg', '회화', '2025-05-20', '2025-06-20', '10:00', '18:00', '대구 아트스페이스', 4000, 4, '청년작가,실험', 'scheduled'),

-- 5
('조각과 공간의 대화', 'https://example.com/posters/sculpture.jpg', '조각', '2025-03-10', '2025-04-30', '10:00', '19:00', '광주문화예술회관', 6000, 5, '조각,공간', 'exhibited'),

-- 6
('시간 속의 풍경', 'https://example.com/posters/landscape.jpg', '회화', '2025-02-01', '2025-03-01', '09:00', '18:00', '인천아트센터', 3000, 6, '풍경화,자연', 'ended'),

-- 7
('VR 미술체험전', 'https://example.com/posters/vr.jpg', '미디어아트', '2025-04-15', '2025-06-01', '12:00', '20:00', '서울 코엑스', 15000, 7, 'VR,체험', 'exhibited'),

-- 8
('모던과 클래식의 경계', 'https://example.com/posters/modern.jpg', '회화', '2025-05-05', '2025-07-01', '10:00', '18:00', '수원미술관', 7000, 8, '모던,클래식', 'scheduled'),

-- 9
('도시와 건축', 'https://example.com/posters/architecture.jpg', '건축', '2025-04-01', '2025-05-20', '10:00', '17:00', '서울시청 시민청', 0, 9, '도시,건축', 'exhibited'),

-- 10
('모던 아트 서울 2025', 'https://example.com/poster1.jpg', '미술', '2025-05-01', '2025-05-31', '10:00', '18:00', '서울 코엑스', 15000, 10, '현대미술,서울', 'scheduled'),

-- 11
('AI & 테크 엑스포', 'https://example.com/poster2.jpg', '기술', '2025-06-10', '2025-06-13', '09:00', '17:00', '부산 벡스코', 10000, 11, 'AI,기술,박람회', 'scheduled'),

-- 12
('역사 속 시간여행', 'https://example.com/poster3.jpg', '역사', '2025-04-15', '2025-07-15', '10:00', '17:00', '국립중앙박물관', 0, 12, '역사,유물,박물관', 'exhibited');



CREATE TABLE news (
  news_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  posterUrl TEXT,
  category TEXT CHECK(category IN ('hire', 'contest', 'etc')),
  status TEXT CHECK(status IN ('scheduled', 'onprogress', 'ended')),
  start_date DATETIME,
  end_date DATETIME,
  create_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_dttm DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news (title, posterUrl, category, status, start_date, end_date)
VALUES
('서울시립미술관 큐레이터 채용 공고', 'https://example.com/posters/hire1.jpg', 'hire', 'scheduled', '2025-06-01', '2025-06-30'),
('제10회 청년작가 공모전', 'https://example.com/posters/contest1.jpg', 'contest', 'onprogress', '2025-04-15', '2025-05-31'),
('서울 아트페어 2025 참가 안내', 'https://example.com/posters/etc1.jpg', 'etc', 'onprogress', '2025-04-01', '2025-06-01'),
('국립현대미술관 전시기획자 모집', 'https://example.com/posters/hire2.jpg', 'hire', 'scheduled', '2025-05-15', '2025-06-14'),
('제5회 디지털 아트 콘테스트', 'https://example.com/posters/contest2.jpg', 'contest', 'scheduled', '2025-07-01', '2025-08-31'),
('부산 국제아트마켓 설명회', 'https://example.com/posters/etc2.jpg', 'etc', 'ended', '2025-02-01', '2025-02-28'),
('수원미술관 교육프로그램 강사 채용', 'https://example.com/posters/hire3.jpg', 'hire', 'ended', '2025-03-01', '2025-03-31'),
('청소년 미술 공모전 2025', 'https://example.com/posters/contest3.jpg', 'contest', 'onprogress', '2025-04-10', '2025-06-10'),
('2025 미술관 자원봉사자 모집 안내', 'https://example.com/posters/etc3.jpg', 'etc', 'scheduled', '2025-05-01', '2025-06-15'),
('제3회 현대조각 공모전', 'https://example.com/posters/contest4.jpg', 'contest', 'ended', '2025-01-01', '2025-03-31');