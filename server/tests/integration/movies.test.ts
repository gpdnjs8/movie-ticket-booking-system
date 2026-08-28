import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/infra/prisma";

const app = createApp();

async function resetDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("test")) {
    throw new Error("테스트는 이름에 'test'가 포함된 DB에서만 실행합니다.");
  }
  await prisma.reservationSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.user.deleteMany();
}

async function createMovies(count: number) {
  for (let i = 1; i <= count; i += 1) {
    await prisma.movie.create({
      data: {
        title: `영화 ${i}`,
        genre: "액션",
        runtimeMin: 120,
        score: 4.5,
      },
    });
  }
}

async function createTheaters(count: number) {
  for (let i = 1; i <= count; i += 1) {
    await prisma.theater.create({
      data: { name: `영화관 ${i}` },
    });
  }
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/movies", () => {
  it("take만큼 조회하고 다음 페이지가 있으면 nextCursor를 반환한다", async () => {
    await createMovies(3);

    const res = await request(app).get("/api/movies").query({ take: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.nextCursor).not.toBeNull();
  });

  it("cursor를 이용해 다음 페이지를 이어서 조회하고 마지막 페이지는 nextCursor가 null이다", async () => {
    await createMovies(3);

    const first = await request(app).get("/api/movies").query({ take: 2 });
    const nextCursor = first.body.data.nextCursor;

    const second = await request(app)
      .get("/api/movies")
      .query({ take: 2, cursor: nextCursor });

    expect(second.status).toBe(200);
    expect(second.body.data.items).toHaveLength(1);
    expect(second.body.data.nextCursor).toBeNull();

    const firstIds = first.body.data.items.map((m: { id: string }) => m.id);
    const secondIds = second.body.data.items.map((m: { id: string }) => m.id);
    expect(firstIds).not.toEqual(expect.arrayContaining(secondIds));
  });

  it("cursor가 숫자 문자열이 아니면 400을 반환한다", async () => {
    const res = await request(app).get("/api/movies").query({ cursor: "abc" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/theaters", () => {
  it("영화관 목록을 커서 기반으로 조회한다", async () => {
    await createTheaters(3);

    const res = await request(app).get("/api/theaters").query({ take: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.nextCursor).not.toBeNull();
  });
});

describe("GET /api/movies/:id/showtimes", () => {
  function toDateString(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  async function createMovieWithTwoTheaters() {
    const movie = await prisma.movie.create({
      data: { title: "인터스텔라", genre: "SF", runtimeMin: 169, score: 4.8 },
    });
    const gangnam = await prisma.theater.create({ data: { name: "강남점" } });
    const busan = await prisma.theater.create({ data: { name: "부산점" } });
    const gangnamScreen = await prisma.screen.create({
      data: { theaterId: gangnam.id, name: "1관", seatCount: 50 },
    });
    const busanScreen = await prisma.screen.create({
      data: { theaterId: busan.id, name: "2관", seatCount: 80 },
    });
    return { movie, gangnam, busan, gangnamScreen, busanScreen };
  }

  it("date로 조회한 날짜의 상영시간만 영화관 단위로 그룹핑해서 반환한다", async () => {
    const { movie, gangnamScreen, busanScreen } = await createMovieWithTwoTheaters();

    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: gangnamScreen.id,
        startAt: new Date("2026-08-29T10:00:00Z"),
        endAt: new Date("2026-08-29T12:49:00Z"),
        price: 12000,
      },
    });
    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: busanScreen.id,
        startAt: new Date("2026-08-29T14:00:00Z"),
        endAt: new Date("2026-08-29T16:49:00Z"),
        price: 13000,
      },
    });
    // 다른 날짜 상영은 결과에 섞여 나오면 안 된다.
    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: gangnamScreen.id,
        startAt: new Date("2026-08-30T10:00:00Z"),
        endAt: new Date("2026-08-30T12:49:00Z"),
        price: 12000,
      },
    });

    const res = await request(app)
      .get(`/api/movies/${movie.id}/showtimes`)
      .query({ date: "2026-08-29" });

    expect(res.status).toBe(200);
    expect(res.body.data.theaters).toHaveLength(2);
    expect(res.body.data.theaters[0].theaterName).toBe("강남점");
    expect(res.body.data.theaters[0].showtimes).toHaveLength(1);
    expect(res.body.data.theaters[0].showtimes[0].screenName).toBe("1관");
    expect(res.body.data.theaters[0].showtimes[0].price).toBe(12000);
    expect(res.body.data.theaters[1].theaterName).toBe("부산점");
  });

  it("theaterId로 특정 영화관만 좁혀서 조회할 수 있다", async () => {
    const { movie, gangnam, gangnamScreen, busanScreen } = await createMovieWithTwoTheaters();

    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: gangnamScreen.id,
        startAt: new Date("2026-08-29T10:00:00Z"),
        endAt: new Date("2026-08-29T12:49:00Z"),
        price: 12000,
      },
    });
    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: busanScreen.id,
        startAt: new Date("2026-08-29T14:00:00Z"),
        endAt: new Date("2026-08-29T16:49:00Z"),
        price: 13000,
      },
    });

    const res = await request(app)
      .get(`/api/movies/${movie.id}/showtimes`)
      .query({ date: "2026-08-29", theaterId: gangnam.id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.theaters).toHaveLength(1);
    expect(res.body.data.theaters[0].theaterName).toBe("강남점");
  });

  it("date를 생략하면 오늘 상영시간만 반환한다", async () => {
    const { movie, gangnamScreen } = await createMovieWithTwoTheaters();

    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: gangnamScreen.id,
        startAt: today,
        endAt: new Date(today.getTime() + 169 * 60 * 1000),
        price: 12000,
      },
    });
    await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: gangnamScreen.id,
        startAt: tomorrow,
        endAt: new Date(tomorrow.getTime() + 169 * 60 * 1000),
        price: 12000,
      },
    });

    const res = await request(app).get(`/api/movies/${movie.id}/showtimes`);

    expect(res.status).toBe(200);
    expect(res.body.data.theaters).toHaveLength(1);
    expect(res.body.data.theaters[0].showtimes).toHaveLength(1);
    expect(res.body.data.theaters[0].showtimes[0].startAt.slice(0, 10)).toBe(toDateString(today));
  });

  it("존재하지 않는 영화면 404를 반환한다", async () => {
    const res = await request(app).get("/api/movies/999999/showtimes");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("MOVIE_NOT_FOUND");
  });

  it("id가 숫자가 아니면 400을 반환한다", async () => {
    const res = await request(app).get("/api/movies/abc/showtimes");
    expect(res.status).toBe(400);
  });

  it("date 형식이 잘못되면 400을 반환한다", async () => {
    const { movie } = await createMovieWithTwoTheaters();
    const res = await request(app)
      .get(`/api/movies/${movie.id}/showtimes`)
      .query({ date: "2026/08/29" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/showtimes/:id/seats", () => {
  async function createShowtimeWithSeats() {
    const movie = await prisma.movie.create({
      data: { title: "인터스텔라", genre: "SF", runtimeMin: 169, score: 4.8 },
    });
    const theater = await prisma.theater.create({ data: { name: "강남점" } });
    const screen = await prisma.screen.create({
      data: { theaterId: theater.id, name: "1관", seatCount: 2 },
    });
    const showtime = await prisma.showtime.create({
      data: {
        movieId: movie.id,
        screenId: screen.id,
        startAt: new Date("2026-08-29T10:00:00Z"),
        endAt: new Date("2026-08-29T12:49:00Z"),
        price: 12000,
      },
    });
    const seatA1 = await prisma.seat.create({
      data: { screenId: screen.id, row: "A", number: 1 },
    });
    const seatA2 = await prisma.seat.create({
      data: { screenId: screen.id, row: "A", number: 2 },
    });
    return { showtime, seatA1, seatA2 };
  }

  it("예약된 좌석은 isBooked: true, 아니면 false로 반환한다", async () => {
    const { showtime, seatA1, seatA2 } = await createShowtimeWithSeats();
    const user = await prisma.user.create({
      data: { email: "seat@example.com", password: "hashed", name: "좌석유저" },
    });
    const reservation = await prisma.reservation.create({
      data: { userId: user.id, showtimeId: showtime.id, totalPrice: 12000 },
    });
    await prisma.reservationSeat.create({
      data: {
        reservationId: reservation.id,
        showtimeId: showtime.id,
        seatId: seatA1.id,
        screenId: seatA1.screenId,
      },
    });

    const res = await request(app).get(`/api/showtimes/${showtime.id}/seats`);

    expect(res.status).toBe(200);
    expect(res.body.data.seats).toHaveLength(2);
    const byId = Object.fromEntries(
      res.body.data.seats.map((s: { id: string; isBooked: boolean }) => [s.id, s.isBooked])
    );
    expect(byId[seatA1.id.toString()]).toBe(true);
    expect(byId[seatA2.id.toString()]).toBe(false);
  });

  it("존재하지 않는 상영이면 404를 반환한다", async () => {
    const res = await request(app).get("/api/showtimes/999999/seats");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SHOWTIME_NOT_FOUND");
  });

  it("id가 숫자가 아니면 400을 반환한다", async () => {
    const res = await request(app).get("/api/showtimes/abc/seats");
    expect(res.status).toBe(400);
  });
});
