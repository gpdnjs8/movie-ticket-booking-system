# 프로젝트: 영화 티켓 예매 시스템

## 기술 스택

- Server: Node.js + Express + TypeScript
- DB: PostgreSQL (Docker, 포트 5433)
- ORM: Prisma
- Frontend: React + TypeScript + Vite + TanStack Query
- 인증: JWT + bcrypt

## 폴더 구조 규칙

서버는 도메인 우선 구조를 쓴다:

server/src/<domain>/
├── controller/ ← 요청 파싱, 응답만. 비즈니스 로직 넣지 않는다.
├── service/ ← 비즈니스 로직. AppError로 에러를 던진다.
├── repository/ ← Prisma 쿼리만. 여기서만 DB에 접근
├── dto/ ← zod 스키마로 요청 검증 + 타입 정의
└── routes/ ← api 라우팅

공통 코드는 도메인 폴더 밖에 둔다: `errors/error.ts`, `middleware/`, `infra/prisma.ts`, `types/`.

프론트엔드는 레이어 우선 구조를 쓴다:

client/src/
├── apis/ components/ context/ hooks/ layouts/
├── pages/ routes/ schemas/ styles/ types/ utils/

## 코딩 규칙

- TypeScript strict 모드. `any` 최소화.
- 에러는 항상 `AppError`를 던진다. 컨트롤러에서 `res.status()` 직접 쓰지 않는다.
- 새 API 만들면 swagger 문서화도 진행한다.
- 성공 응답은 `common/response.ts`의 `success(res, statusCode, data)`로 통일한다.
  모든 성공 응답은 `{ data: ... }` 형태다. 컨트롤러에서 `res.status().json()`을 직접 쓰지 않는다.
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
- 프론트에서 서버 데이터 페칭/뮤테이션은 TanStack Query의 `useQuery`/`useMutation`/`useInfiniteQuery`로 한다. `useState`+`useEffect`로 직접 fetch하지 않는다 (로딩 해제 누락, stale 응답 경쟁 상태를 막기 위함).

## 에러 응답 형식

```json
{ "error": { "code": "SEAT_ALREADY_BOOKED", "message": "이미 예약된 좌석이 포함되어 있습니다." } }
```

## 구현 체크리스트

### 1. auth — 인증/인가

- [x] POST /api/auth/register — bcrypt 해시, accessToken(15m, 바디) + refreshToken(7d, httpOnly 쿠키) 발급, 이메일 중복 409
- [x] POST /api/auth/login — 401 시 이메일/비번 구분 안 함
- [x] POST /api/auth/refresh — 쿠키 검증 후 accessToken 재발급 (stateless)
- [x] POST /api/auth/logout — accessToken 필요(requireAuth), refreshToken 쿠키 삭제
- [x] requireAuth 미들웨어 — req.user.userId만 신뢰, 요청 바디의 사용자 식별값 사용 금지

### 2. movies — 커서 기반 페이지네이션

- [x] GET /api/movies, /api/theaters — `?cursor&take` 커서 페이지네이션, `nextCursor` 응답 포함
- [x] GET /api/movies/:id/showtimes — 영화관 단위로 그룹핑, `?date&theaterId` 쿼리로 서버에서 필터링(date 생략 시 오늘)
- [x] GET /api/showtimes/:id/seats — 좌석 + isBooked, 상영 가격(price) 포함

### 3. reservations — 흐름: 영화 → 영화관/상영시간 → 좌석

- [x] POST /api/reservations — seatIds 1~6개(최대 6개), 트랜잭션 + `(showtimeId, seatId)` unique 제약으로 중복예매 차단, 이미 예약 시 409
- [x] **동시성 테스트 필수**: 동시 요청 시 1건만 201, 나머지 409 (실제 PostgreSQL)
- [x] GET /api/reservations/me — req.user.userId 기준 최신순

### 4. 프론트엔드

- [x] axios `withCredentials: true`
- [x] ProtectedRoute — 좌석선택/예매내역은 비로그인 시 /login 리다이렉트
- [x] 영화 목록 — 무한스크롤(커서 기반) + 스켈레톤 UI (영화관 목록 페이지는 프론트에 없음, `/api/theaters` 미사용)
- [x] tailwindcss 사용
