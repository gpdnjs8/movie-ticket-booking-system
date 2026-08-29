import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/infra/prisma";
import { assertTestDatabaseUrl } from "../helpers/assertTestDatabase";

const app = createApp();

async function resetDb() {
  assertTestDatabaseUrl(process.env.DATABASE_URL ?? "");
  await prisma.reservationSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.user.deleteMany();
}

async function createShowtimeWithSeats(seatCount = 4) {
  const movie = await prisma.movie.create({
    data: { title: "인터스텔라", genre: "SF", runtimeMin: 169, score: 4.8 },
  });
  const theater = await prisma.theater.create({ data: { name: "강남점" } });
  const screen = await prisma.screen.create({
    data: { theaterId: theater.id, name: "1관", seatCount },
  });
  const showtime = await prisma.showtime.create({
    data: {
      movieId: movie.id,
      screenId: screen.id,
      startAt: new Date("2026-09-01T10:00:00Z"),
      endAt: new Date("2026-09-01T12:49:00Z"),
      price: 12000,
    },
  });

  const seats = [];
  for (let i = 1; i <= seatCount; i += 1) {
    seats.push(await prisma.seat.create({ data: { screenId: screen.id, row: "A", number: i } }));
  }

  return { movie, theater, screen, showtime, seats };
}

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "password123", name: "테스터" });
  return res.body.data.accessToken as string;
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/reservations", () => {
  it("좌석을 선택해 예매하면 201과 함께 예매 정보(가격, 좌석, 상태)를 반환한다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats();
    const token = await registerAndLogin("book@example.com");

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        showtimeId: showtime.id.toString(),
        seatIds: [seats[0].id.toString(), seats[1].id.toString()],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.totalPrice).toBe(24000);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(res.body.data.seats).toHaveLength(2);
  });

  it("인증 토큰이 없으면 401을 반환한다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats();

    const res = await request(app)
      .post("/api/reservations")
      .send({ showtimeId: showtime.id.toString(), seatIds: [seats[0].id.toString()] });

    expect(res.status).toBe(401);
  });

  it("seatIds가 비어있으면 400을 반환한다", async () => {
    const { showtime } = await createShowtimeWithSeats();
    const token = await registerAndLogin("empty@example.com");

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [] });

    expect(res.status).toBe(400);
  });

  it("seatIds가 7개 이상이면 400을 반환한다", async () => {
    const { showtime } = await createShowtimeWithSeats();
    const token = await registerAndLogin("toomany@example.com");
    const seatIds = Array.from({ length: 7 }, (_, i) => String(i + 1));

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ showtimeId: showtime.id.toString(), seatIds });

    expect(res.status).toBe(400);
  });

  it("seatIds에 중복된 좌석이 있으면 400을 반환한다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats();
    const token = await registerAndLogin("dup@example.com");

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        showtimeId: showtime.id.toString(),
        seatIds: [seats[0].id.toString(), seats[0].id.toString()],
      });

    expect(res.status).toBe(400);
  });

  it("존재하지 않는 상영시간이면 404를 반환한다", async () => {
    const token = await registerAndLogin("noshowtime@example.com");

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ showtimeId: "999999", seatIds: ["1"] });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SHOWTIME_NOT_FOUND");
  });

  it("해당 상영의 상영관에 속하지 않는 좌석이면 400 INVALID_SEATS를 반환한다", async () => {
    const { showtime } = await createShowtimeWithSeats();
    const otherTheater = await prisma.theater.create({ data: { name: "다른 영화관" } });
    const otherScreen = await prisma.screen.create({
      data: { theaterId: otherTheater.id, name: "2관", seatCount: 1 },
    });
    const otherSeat = await prisma.seat.create({
      data: { screenId: otherScreen.id, row: "A", number: 1 },
    });
    const token = await registerAndLogin("wrongseat@example.com");

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [otherSeat.id.toString()] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_SEATS");
  });

  it("이미 예약된 좌석이 포함되어 있으면 409 SEAT_ALREADY_BOOKED를 반환한다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats();
    const tokenA = await registerAndLogin("first@example.com");
    const tokenB = await registerAndLogin("second@example.com");

    const first = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [seats[0].id.toString()] });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        showtimeId: showtime.id.toString(),
        seatIds: [seats[0].id.toString(), seats[1].id.toString()],
      });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("SEAT_ALREADY_BOOKED");

    // 사전 점검에서 이미 막혔으므로 좌석 하나도 예약되지 않아야 한다(부분 성공 없음).
    const seatOneReservation = await prisma.reservationSeat.findMany({
      where: { showtimeId: showtime.id, seatId: seats[1].id },
    });
    expect(seatOneReservation).toHaveLength(0);
  });

  it("동시에 같은 좌석을 예매 요청하면 실제 DB에서 정확히 1건만 201, 나머지는 모두 409로 처리된다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats(1);
    const concurrency = 10;

    const tokens = await Promise.all(
      Array.from({ length: concurrency }, (_, i) => registerAndLogin(`race${i}@example.com`))
    );

    const responses = await Promise.all(
      tokens.map((token) =>
        request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${token}`)
          .send({ showtimeId: showtime.id.toString(), seatIds: [seats[0].id.toString()] })
      )
    );

    const succeeded = responses.filter((r) => r.status === 201);
    const conflicted = responses.filter((r) => r.status === 409);

    expect(succeeded).toHaveLength(1);
    expect(conflicted).toHaveLength(concurrency - 1);
    conflicted.forEach((r) => expect(r.body.error.code).toBe("SEAT_ALREADY_BOOKED"));

    // 최종적으로 DB에 해당 좌석의 예약 연결이 정확히 1건만 존재해야 한다.
    const seatReservations = await prisma.reservationSeat.findMany({
      where: { showtimeId: showtime.id, seatId: seats[0].id },
    });
    expect(seatReservations).toHaveLength(1);

    const reservationCount = await prisma.reservation.count({ where: { showtimeId: showtime.id } });
    expect(reservationCount).toBe(1);
  });
});

describe("GET /api/reservations/me", () => {
  it("본인의 예매 내역만 최신순으로 반환한다", async () => {
    const { showtime, seats } = await createShowtimeWithSeats(4);
    const tokenA = await registerAndLogin("me-a@example.com");
    const tokenB = await registerAndLogin("me-b@example.com");

    const first = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [seats[0].id.toString()] });

    const second = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [seats[1].id.toString()] });

    await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ showtimeId: showtime.id.toString(), seatIds: [seats[2].id.toString()] });

    const res = await request(app)
      .get("/api/reservations/me")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].id).toBe(second.body.data.id);
    expect(res.body.data.items[1].id).toBe(first.body.data.id);
    res.body.data.items.forEach((item: { movieTitle: string; theaterName: string }) => {
      expect(item.movieTitle).toBe("인터스텔라");
      expect(item.theaterName).toBe("강남점");
    });
  });

  it("인증 토큰이 없으면 401을 반환한다", async () => {
    const res = await request(app).get("/api/reservations/me");
    expect(res.status).toBe(401);
  });
});
