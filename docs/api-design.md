# API 설계 문서

서버(`server/`) 쪽 구현을 도메인별로 설계 → 구현 순서로 정리한다. 코딩 규칙/폴더 구조는 `.claude/CLAUDE.md`를 참고.

## 공통 규칙

- 성공 응답: `{ "data": ... }` (`common/response.ts`의 `success()`)
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }` (`middleware/error.middleware.ts`)
- 인증: JWT. accessToken은 응답 바디로 발급(15분), refreshToken은 httpOnly 쿠키로 발급(7일). `requireAuth` 미들웨어가 `Authorization: Bearer <accessToken>`을 검증해서 `req.user`를 채운다.

---

## 1. auth — 회원가입/로그인/토큰 재발급/로그아웃

**설계**

- `POST /api/auth/register`: 이메일 중복이면 409(`EMAIL_TAKEN`). bcrypt로 비밀번호 해시.
- `POST /api/auth/login`: 이메일이 없거나 비밀번호가 틀려도 항상 같은 401(`INVALID_CREDENTIALS`) — 계정 존재 여부가 노출되지 않게.
- `POST /api/auth/refresh`: `req.cookies.refreshToken`을 검증해서 accessToken만 재발급(stateless, DB 조회로 refreshToken을 저장/조회하지 않음).
- `POST /api/auth/logout`: `requireAuth` 필요. refreshToken 쿠키를 지운다.

**구현**

- `auth/routes/auth.routes.ts` → `auth/controller/auth.controller.ts` → `auth/service/auth.service.ts` → `auth/repository/auth.repository.ts`
- 토큰 발급/검증은 `utils/jwt.ts`의 `signAccessToken`/`signRefreshToken`/`verifyAccessToken`/`verifyRefreshToken`
- 요청 검증 스키마: `auth/dto/auth.dto.ts` (zod)

---

## 2. movies / theaters — 목록 조회 (커서 페이지네이션)

**설계**

- `GET /api/movies`, `GET /api/theaters`: `?cursor&take`(기본 10, 최대 50) 커서 페이지네이션. 응답에 `nextCursor`(다음 페이지 없으면 `null`) 포함.
- 커서는 마지막으로 받은 항목의 `id`(문자열)를 그대로 다음 요청의 `cursor`로 보내는 방식.

**구현**

- `movies/routes/movies.routes.ts`, `movies/routes/theaters.routes.ts`
- 커서 페이지네이션 공통 로직: `common/pagination.ts`의 `buildCursorPage()` — `take+1`개를 조회해서 `take`개 초과 여부로 `nextCursor` 유무를 판단
- 각 도메인의 `service`/`repository`가 이 헬퍼를 재사용

---

## 3. movies/:id/showtimes — 영화 상영시간 조회

**설계**

- `GET /api/movies/:id/showtimes?date&theaterId`
- 영화관 단위로 그룹핑해서 반환(`theaters: [{ theaterId, theaterName, showtimes: [...] }]`)
- `date` 생략 시 서버 기준 오늘 날짜. `theaterId` 생략 시 전체 영화관.
- 날짜/영화관 둘 다 **서버에서 필터링**한다(프론트가 전체 데이터를 받아서 거르지 않음) — 한 영화가 하루에 여러 영화관에서 상영되므로 응답 크기가 크지 않다.

**구현**

- `movies/routes/movies.routes.ts` (같은 라우터 파일에 `/movies`와 `/movies/:id/showtimes`가 같이 있음)
- `movies/service/showtime.service.ts`, `movies/repository/showtime.repository.ts`
- `date` 쿼리는 자정~다음날 자정 범위로 변환해서 `startAt` 필터에 사용

---

## 4. showtimes/:id/seats — 좌석 조회

**설계**

- `GET /api/showtimes/:id/seats` — **공개 API**(로그인 없이도 조회 가능, 좌석 배치만 보고 싶은 경우 대비)
- 응답: `{ showtimeId, price, myReservedCount, seats: [{ id, row, number, isBooked }] }`
  - `price`: 이 상영의 좌석 단가(프론트가 하드코딩하지 않도록)
  - `myReservedCount`: **로그인한 사용자가 이 상영에 이미 예매(CONFIRMED)해둔 좌석 수**. 비로그인이면 0.
- `isBooked`는 그 좌석이 이 상영에 대해 이미 예약됐는지 여부(예약자가 누구인지는 노출 안 함).

**구현**

- `movies/routes/showtimes.routes.ts` — `attachUserIfPresent` 미들웨어를 붙여서, Authorization 헤더가 있으면 `req.user`를 채우고 없거나 만료됐어도 막지 않고 통과시킨다(공개 API 유지하면서 로그인 여부만 선택적으로 파악).
- `movies/service/seat.service.ts` — 좌석 목록 + `reservations/repository/reservation.repository.ts`의 `countUserSeatsForShowtime()`을 병렬로 조회(`Promise.all`)해서 `myReservedCount` 계산
- 도메인 간 참조: `movies` 도메인 서비스가 `reservations` 도메인 레포지토리를 직접 import — CLAUDE.md의 도메인 우선 구조에서도 서비스 레이어끼리는 필요하면 다른 도메인을 참조할 수 있다(예: `reservation.service.ts`도 `movies/repository/showtime.repository.ts`를 참조).

---

## 5. reservations — 예매 생성 / 내 예매 목록

**설계**

- `POST /api/reservations` (requireAuth): `{ showtimeId, seatIds }`
  - `seatIds`: 1~6개, 중복 불가 (요청 1건당 상한)
  - 좌석이 그 상영의 상영관에 속하지 않으면 400(`INVALID_SEATS`)
  - 이미 예약된 좌석이 포함되면 409(`SEAT_ALREADY_BOOKED`)
  - **상영별 사용자 누적 좌석 상한**: 같은 상영에 대해 그 사용자가 이미 예매(CONFIRMED)한 좌석 수 + 이번 요청 좌석 수가 6석을 넘으면 400(`SEAT_LIMIT_EXCEEDED`) — "한 번에 6석"이 아니라 "한 상영당 총 6석"이 실제 규칙
  - 동시에 같은 좌석에 예매 요청이 들어와도 **정확히 1건만 성공**해야 한다(동시성 안전)
- `GET /api/reservations/me` (requireAuth): 본인 예매만 최신순, 커서 페이지네이션

**구현**

- `reservations/service/reservation.service.ts`의 `create()`:
  1. 상영 존재 확인 → 404
  2. 좌석이 해당 상영관 소속인지 확인 → 400 INVALID_SEATS
  3. 이미 예약된 좌석인지 사전 확인 → 409 SEAT_ALREADY_BOOKED
  4. 누적 좌석 상한 확인(`reservationRepository.countUserSeatsForShowtime`) → 400 SEAT_LIMIT_EXCEEDED
  5. `reservationRepository.createWithSeats()` — Prisma 트랜잭션 안에서 `reservation` 생성 + `reservationSeat`를 `createMany`로 한 번에 생성
- 동시성 안전장치는 사전 체크(3번)가 아니라 DB 유니크 제약: `reservation_seats` 테이블의 `@@unique([showtimeId, seatId])`. 두 요청이 동시에 3번을 통과해도, 트랜잭션 커밋 시점에 유니크 제약 위반(Prisma 에러코드 `P2002`)이 나면 `isSeatUniqueConstraintError()`로 잡아서 409로 변환한다.
  - 반대로 `SEAT_LIMIT_EXCEEDED`(누적 상한) 체크는 사전 체크만 있고 DB 제약으로 뒷받침되지 않는다. 극단적으로 동시에 여러 요청을 보내면 이 상한을 우회할 수 있는 이론적 여지가 있음(좌석 중복 예매만큼 엄격하게 다뤄지진 않음).
- `GET /api/reservations/me`: `reservationRepository.findByUserId()` — 커서 페이지네이션은 2번 항목과 동일한 방식
