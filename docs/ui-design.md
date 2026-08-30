# 프론트엔드 화면 설계 문서

`client/` 화면 구현을 설계 → 구현 순서로 정리한다. 코딩 규칙/폴더 구조는 `.claude/CLAUDE.md`를 참고.

## 공통 구조

- 데이터 페칭/뮤테이션: TanStack Query(`useQuery`/`useMutation`/`useInfiniteQuery`)로 통일. `useState`+`useEffect`로 직접 fetch하지 않는다.
- axios 인스턴스(`apis/axiosInstance.ts`): `withCredentials: true`, 요청 인터셉터가 `localStorage`의 accessToken을 `Authorization` 헤더에 자동으로 붙임
- 인증 상태: `context/auth.tsx`의 `AuthProvider`가 전역으로 관리(로그인/로그아웃/세션 복원)
- 라우팅: `routes/router.tsx` — 좌석선택/예매내역은 `ProtectedRoute`로 감싸서 비로그인 시 `/login`으로 리다이렉트

### accessToken 자동 재발급 흐름 (`apis/axiosInstance.ts`)

1. 아무 요청이나 401을 받으면 응답 인터셉터가 `/api/auth/refresh`(httpOnly 쿠키 기반)를 호출해 새 accessToken을 받아온다.
2. 여러 요청이 동시에 401을 맞아도 `refreshPromise`를 공유해서 refresh 호출은 한 번만 나간다.
3. 새 토큰으로 원래 요청을 한 번 재시도한다. `/api/auth/*` 요청 자체는 재시도 대상에서 제외.
4. **로그아웃 레이스 컨디션 방지**: `invalidateSession()`으로 세션 세대(generation) 카운터를 올리는데, 이걸 원격 로그아웃 요청을 `await`하기 *전에* 동기적으로 실행한다. 로그아웃 도중 이미 진행 중이던 refresh 응답이 나중에 와도, 세대가 바뀐 걸 감지하면 토큰을 저장하지 않고 원래 요청도 재시도하지 않는다.

### 세션 복원 (새로고침 시 로그인 유지)

별도의 `/api/auth/me` 엔드포인트 없이, 로그인 시 `localStorage`에 저장해둔 유저 정보 + `refreshAccessToken()`(리프레시 쿠키) 조합으로 복원한다(`context/auth.tsx`). 복원 중에는 `isRestoring`이 true라서 `ProtectedRoute`가 성급하게 `/login`으로 튕기지 않는다.

---

## 1. 로그인 / 회원가입 (`pages/auth/login.tsx`, `register.tsx`)

**설계**

- 이메일/비밀번호(+회원가입은 이름) 폼. zod 스키마(`schemas/auth.ts`)로 클라이언트 단에서 먼저 검증하고, 통과하면 서버로 요청.
- 로그인/회원가입 성공 시 `loginSuccess(user, accessToken)`으로 세션 저장 후 이동(로그인은 이전 페이지 또는 `/`, 회원가입은 `/`).
- 서버 에러(이메일 중복 409, 로그인 실패 401 등)는 폼 아래에 문구로 표시.

**구현**

- `useMutation({ mutationFn: login })` / `useMutation({ mutationFn: register })` — `mutation.isPending`으로 버튼 비활성화, `mutation.isError` + `getErrorMessage(mutation.error, fallback)`으로 에러 문구 표시
- zod 검증 실패는 필드별 에러(`useState<Record<string,string>>`)로 별도 관리(react-query 대상 아님, 서버 호출 전에 걸러내는 로컬 검증이라서)

---

## 2. 영화 목록 (`pages/movies/movies.tsx`)

**설계**

- 커서 기반 무한스크롤. 로딩 중엔 스켈레톤 카드(`MovieCardSkeleton`) 12개 표시.
- 영화 카드(`MovieCard`)는 서버가 준 `posterUrl`을 그대로 사용(없을 때 폴백 없음 — 시드 데이터에 항상 포스터가 있다고 가정).

**구현**

- `useInfiniteQuery({ queryKey: ["movies"], queryFn, getNextPageParam })` + `hooks/useInfiniteScroll.ts`(IntersectionObserver로 하단 sentinel 감지)
- 로딩/에러/다음 페이지 로딩 상태를 전부 react-query가 제공(`isLoading`/`error`/`isFetchingNextPage`/`hasNextPage`)

---

## 3. 상영 시간표 (`pages/movies/showtimes.tsx`)

**설계**

- 영화 상세에서 영화관/날짜를 골라 그 조건의 상영시간만 조회. 기본값은 오늘 날짜 + 전체 영화관.
- **현재 시각 이전 상영시간은 목록에서 제외**(지나간 시간대는 예매 불가하므로). 남은 상영시간이 없는 영화관은 드롭다운/목록에서 같이 빠진다.
- 시간 표시는 서버가 UTC로 내려주는 걸 로컬(한국) 시간으로 변환해서 보여준다(`utils/formatDate.ts`의 `formatTime`) — 한때 UTC 문자열을 그대로 잘라 써서 "01:00"으로 잘못 보이던 버그가 있었음.

**구현**

- `useQuery({ queryKey: ["showtimes", movieId, selectedDate, selectedTheaterId], queryFn })` — 쿼리 키에 필터 값이 포함돼 있어서, 필터를 빠르게 바꿔도 이전(stale) 요청의 응답이 최신 필터 결과를 덮어쓰는 경쟁 상태가 react-query 레벨에서 자동으로 방지된다.
- 날짜는 `<input type="date">`, 영화관은 `<select>`(서버가 `?theaterId`로 필터링해서 응답)

---

## 4. 좌석 선택 + 예매 (`pages/movies/seatselection.tsx`)

**설계**

- 좌석 배치도에서 좌석을 클릭해 선택(최대 6석, 단 **이 상영에 이미 예매해둔 좌석이 있으면 그만큼 차감**해서 남은 개수만 선택 가능).
- 이미 예약된 좌석(`isBooked`)도 클릭은 되지만(마우스 커서 막지 않음) 토스트로 "이미 예약된 좌석입니다" 안내만 하고 선택되지는 않는다.
- 6석(또는 남은 한도) 초과 선택 시 토스트로 안내.
- 예매 실패(서버가 409/400 등을 반환) 시에도 같은 토스트로 서버 에러 메시지를 그대로 보여준다.
- 좌석 단가(`price`)는 서버 응답값을 쓴다(하드코딩 안 함).

**구현**

- 좌석 조회: `useQuery({ queryKey: ["seats", showtimeId], queryFn })` — 응답의 `myReservedCount`로 `remainingLimit = MAX_SEATS - myReservedCount` 계산
- 예매 제출: `useMutation({ mutationFn: createReservation, onSuccess, onError })` — 성공 시 `/reservations/me`로 이동, 실패 시 토스트
- 토스트: 별도 라이브러리 없이 로컬 상태(`toastMessage`) + `setTimeout`으로 2.5초 뒤 자동 숨김. 좌석 배치도 컨테이너를 `relative`로 감싸고 토스트를 그 위에 `absolute`로 띄워서, 화면 스크롤 위치와 무관하게 좌석 배치도 바로 위에 나타난다.

---

## 5. 내 예매 내역 (`pages/reservation/myreservations.tsx`)

**설계**

- 본인 예매 목록을 최신순 무한스크롤로 조회.
- **같은 상영에 대해 여러 번 나눠 예매한 경우(예: 2석 예매 후 나중에 4석 추가 예매) 화면에서는 한 줄로 합쳐서 보여준다** — 좌석은 합치고 금액은 합산. 단, 예매 상태(status)가 다르면(취소 건 등) 섞지 않고 따로 표시.

**구현**

- `useInfiniteQuery({ queryKey: ["myReservations"], queryFn })`로 원본 예매 목록을 가져온 뒤, `groupByShowtime()` 함수로 `showtimeId:status`를 키로 클라이언트에서 그룹핑해서 렌더링
- **서버 API 자체는 그룹핑하지 않는다** — 원본은 여전히 예매 건별로 개별 레코드로 응답되며(추후 "개별 예매 취소" 같은 기능을 만들 때 필요), 화면 표시만 합친다.
- 좌석은 행(row)·번호 순으로 정렬해서 보여줌
