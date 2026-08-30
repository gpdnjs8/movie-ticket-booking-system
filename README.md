# 영화 티켓 예매 시스템

회원가입/로그인부터 영화·상영시간 조회, 좌석 선택 및 예매, 예매 내역 조회까지 이어지는 흐름을 구현한 영화 티켓 예매 웹 서비스입니다.

## 기술 스택

Server: Node.js (Express, TypeScript)
Database: PostgreSQL (Docker)
ORM: Prisma
Frontend: React (Vite, TypeScript)
인증: JWT + bcrypt
스타일: Tailwind CSS
테스트: Jest + Supertest
API 문서: Swagger

## 실행 방법

### 1. 클론 및 설치

```bash
git clone https://github.com/gpdnjs8/movie-ticket-booking-system.git
cd movie-ticket-booking-system
npm install
```

`npm install`은 workspaces(`server`, `client`)를 한 번에 설치합니다.

### 2. 환경 변수 설정

```bash
cp server/.env.example server/.env
cp server/.env.test.example server/.env.test
cp client/.env.example client/.env
```

### 3. DB 실행

```bash
docker compose up -d
```

PostgreSQL이 5433 포트로 실행됩니다.

### 4. 마이그레이션 및 시드 데이터

```bash
npm run prisma:migrate -w server
npm run seed -w server
```

시드 스크립트로 영화/상영관/상영시간 등 임의 데이터가 생성됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

서버와 클라이언트가 동시에 실행됩니다.

**클라이언트**: http://localhost:5173

**서버**: http://localhost:4000

**API 문서(Swagger)**: http://localhost:4000/docs

### 테스트

`server` 디렉토리에서 실행합니다. (DB는 위 실행 방법의 `docker compose up -d`로 이미 떠 있어야 합니다.)

```bash
cd server
npm run prisma:migrate:test
npm test
```

## 프로젝트 구조

npm workspaces 기반 모노레포입니다.

```
booking-system/
├── server/
├── client/
├── docs/
└── docker/
```

### server/src — 도메인 우선 구조

도메인(`auth`, `movies`, `reservations`)마다 같은 레이어 구성을 반복합니다.

```
server/src/
├── auth/           ← 회원가입/로그인/토큰 재발급/로그아웃
├── movies/         ← 영화·영화관 목록, 상영시간, 좌석 조회
├── reservations/   ← 예매 생성, 내 예매 내역 조회
├── common/         ← 응답 포맷, 커서 페이지네이션 등 공통 유틸
├── errors/         ← AppError
├── middleware/     ← requireAuth, 에러 핸들러
├── infra/          ← Prisma 클라이언트, Swagger 설정
├── types/          ← Express Request 타입 확장 등
└── utils/          ← JWT 서명/검증 등
```

각 도메인 폴더는 다음 구조를 따릅니다.

```
<domain>/
├── controller/  ← 요청 파싱, 응답
├── service/     ← 비즈니스 로직
├── repository/  ← Prisma 쿼리
├── dto/         ← zod 검증 스키마 + 타입
└── routes/      ← API 라우팅 (swagger 문서 포함)
```

### client/src — 레이어 우선 구조

```
client/src/
├── apis/         ← axios 인스턴스, 도메인별 API 호출 함수
├── components/   ← 재사용 UI 컴포넌트
├── context/      ← 인증 전역 상태
├── hooks/        ← 커스텀 훅
├── layouts/      ← 페이지 레이아웃
├── pages/        ← 화면 단위 컴포넌트
├── routes/       ← 라우터 설정, ProtectedRoute
├── schemas/      ← zod 폼 검증 스키마
├── types/        ← API 응답/도메인 타입
└── utils/        ← 날짜 포맷, 에러 메시지 추출 등
```

## 설계 의도

**Express**: 미들웨어 체인이 단순해서 도메인별 계층 구조(controller/service/repository)를 얹기 쉬움

**Prisma**: PostgreSQL 스키마와 TypeScript 타입을 자동 동기화, 마이그레이션 이력 관리가 편함

**bcrypt**: 비밀번호를 원문 대신 해시로 저장

**zod**: 요청 바디를 타입과 함께 검증, 잘못된 입력을 컨트롤러 진입 전에 차단

**TanStack Query**: 로딩 해제 누락, stale 응답 경쟁 상태 같은 반복 버그 해결

**에러 처리 통일**: 에러는 `AppError`로만 던지고, 성공/실패 응답 포맷 통일

**복합 외래키로 정합성 강제**: `reservation_seats`가 좌석/상영을 각각 `(id, screenId)` 조합으로 참조하게 해서, "다른 상영관 좌석 예매" 같은 상태가 DB 레벨에서 불가능하게 설계

## 고려한 사항

### 좌석 선택 및 예매

동시성 제어: `(showtimeId, seatId)` DB 유니크 제약위반 시 409로 변환하며 동시 요청 통합 테스트로 검증

원자성 보장: 예매 생성과 좌석 배정을 단일 트랜잭션으로 묶어 부분 반영 방지

상영별 좌석 상한: 한 번 요청이 아니라 상영당 누적 6석으로 제한

### 목록 조회

대용량 데이터를 고려하여 커서 기반 페이지네이션으로 구현

### 화면 - 사용자 경험

버튼 비활성화 대신 토스트로 실패 사유 안내

무한스크롤 + 스켈레톤 UI
