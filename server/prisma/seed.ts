import "dotenv/config";
import { prisma } from "../src/infra/prisma";

const THEATER_NAMES = ["강남점", "홍대점", "잠실점", "여의도점", "신촌점"];
const SCREEN_NAMES = ["1관", "2관", "3관", "4관", "5관", "6관"];
const SEAT_ROWS = ["A", "B", "C", "D", "E", "F"];
const SEATS_PER_ROW = 8;

const MOVIES: {
  title: string;
  genre: string;
  runtimeMin: number;
  score: number;
}[] = [
  { title: "인터스텔라", genre: "SF", runtimeMin: 169, score: 4.8 },
  { title: "기생충", genre: "드라마", runtimeMin: 132, score: 4.9 },
  { title: "어벤져스: 엔드게임", genre: "액션", runtimeMin: 181, score: 4.7 },
  { title: "라라랜드", genre: "로맨스", runtimeMin: 128, score: 4.6 },
  { title: "조커", genre: "드라마", runtimeMin: 122, score: 4.5 },
  { title: "겨울왕국", genre: "애니메이션", runtimeMin: 102, score: 4.3 },
  { title: "인셉션", genre: "SF", runtimeMin: 148, score: 4.7 },
  { title: "아바타: 물의 길", genre: "SF", runtimeMin: 192, score: 4.4 },
  { title: "범죄도시3", genre: "액션", runtimeMin: 108, score: 4.0 },
  { title: "서울의 봄", genre: "드라마", runtimeMin: 141, score: 4.6 },
  { title: "스파이더맨: 노 웨이 홈", genre: "액션", runtimeMin: 148, score: 4.5 },
  { title: "탑건: 매버릭", genre: "액션", runtimeMin: 130, score: 4.6 },
  { title: "알라딘", genre: "판타지", runtimeMin: 128, score: 4.2 },
  { title: "극한직업", genre: "코미디", runtimeMin: 111, score: 4.4 },
  { title: "미나리", genre: "드라마", runtimeMin: 116, score: 4.3 },
  { title: "부산행", genre: "액션", runtimeMin: 118, score: 4.5 },
  { title: "명량", genre: "액션", runtimeMin: 128, score: 4.2 },
  { title: "라이온 킹", genre: "애니메이션", runtimeMin: 118, score: 4.1 },
  { title: "헤어질 결심", genre: "드라마", runtimeMin: 138, score: 4.4 },
  { title: "오펜하이머", genre: "드라마", runtimeMin: 180, score: 4.7 },
];

const OPENING_TIME = "10:00";
const SHOWS_PER_DAY = 6;
const CLEANUP_MINUTES = 20;
const DAY_RANGE = 7;
const FIXED_PRICE = 15000;

function randomAugustDate() {
  const year = new Date().getFullYear();
  const day = Math.floor(Math.random() * 31) + 1;
  return new Date(year, 7, day);
}

async function resetMoviesDomain() {
  await prisma.$executeRaw`TRUNCATE TABLE "reservation_seats", "reservations", "showtimes", "seats", "screens", "movies", "theaters" RESTART IDENTITY CASCADE;`;
}

async function createMovies() {
  const movies = [];
  for (let movieIndex = 0; movieIndex < MOVIES.length; movieIndex += 1) {
    const movieData = MOVIES[movieIndex];
    const movie = await prisma.movie.create({
      data: {
        title: movieData.title,
        genre: movieData.genre,
        runtimeMin: movieData.runtimeMin,
        score: movieData.score,
        releaseDate: randomAugustDate(),
        posterUrl: `https://picsum.photos/seed/movie-${movieIndex + 1}/400/600`,
        description: `${movieData.title}의 줄거리입니다.`,
      },
    });
    movies.push(movie);
  }
  return movies;
}

async function createTheatersWithScreensAndSeats() {
  const theaters: { screens: { id: bigint }[] }[] = [];

  for (const theaterName of THEATER_NAMES) {
    const theater = await prisma.theater.create({ data: { name: theaterName } });
    const screens: { id: bigint }[] = [];

    for (const screenName of SCREEN_NAMES) {
      const screen = await prisma.screen.create({
        data: {
          theaterId: theater.id,
          name: screenName,
          seatCount: SEAT_ROWS.length * SEATS_PER_ROW,
        },
      });

      await prisma.seat.createMany({
        data: SEAT_ROWS.flatMap((row) =>
          Array.from({ length: SEATS_PER_ROW }, (_, i) => ({
            screenId: screen.id,
            row,
            number: i + 1,
          }))
        ),
      });

      screens.push(screen);
    }

    theaters.push({ screens });
  }

  return theaters;
}

function buildStartAt(baseDate: Date, dayOffset: number, hhmm: string) {
  const [hour, minute] = hhmm.split(":").map(Number);
  const startAt = new Date(baseDate);
  startAt.setDate(startAt.getDate() + dayOffset);
  startAt.setHours(hour, minute, 0, 0);
  return startAt;
}

function shuffledIndexes(length: number): number[] {
  const indexes = Array.from({ length }, (_, i) => i);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes;
}

async function createShowtimes(
  theaters: { screens: { id: bigint }[] }[],
  movies: { id: bigint; runtimeMin: number }[]
) {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const showtimeRows: {
    movieId: bigint;
    screenId: bigint;
    startAt: Date;
    endAt: Date;
    price: number;
  }[] = [];

  for (let dayOffset = 0; dayOffset < DAY_RANGE; dayOffset += 1) {
    for (let theaterIndex = 0; theaterIndex < theaters.length; theaterIndex += 1) {
      const theater = theaters[theaterIndex];
      const theaterOffsetMinutes = theaterIndex * 7;
      const screenOrder = shuffledIndexes(SCREEN_NAMES.length);

      for (let slot = 0; slot < SCREEN_NAMES.length; slot += 1) {
        const movieIndex = (dayOffset * SCREEN_NAMES.length + slot) % movies.length;
        const movie = movies[movieIndex];
        const screenIndex = screenOrder[slot];

        let startAt = new Date(
          buildStartAt(baseDate, dayOffset, OPENING_TIME).getTime() +
            theaterOffsetMinutes * 60 * 1000
        );

        for (let show = 0; show < SHOWS_PER_DAY; show += 1) {
          const endAt = new Date(startAt.getTime() + movie.runtimeMin * 60 * 1000);

          showtimeRows.push({
            movieId: movie.id,
            screenId: theater.screens[screenIndex].id,
            startAt,
            endAt,
            price: FIXED_PRICE,
          });

          startAt = new Date(endAt.getTime() + CLEANUP_MINUTES * 60 * 1000);
        }
      }
    }
  }

  await prisma.showtime.createMany({ data: showtimeRows });
  return showtimeRows.length;
}

async function main() {
  await resetMoviesDomain();
  const movies = await createMovies();
  const theaters = await createTheatersWithScreensAndSeats();
  const showtimeCount = await createShowtimes(theaters, movies);
  // eslint-disable-next-line no-console -- 시드 완료 알림용 의도된 로그
  console.log(
    `시드 완료: 영화관 ${THEATER_NAMES.length}개(영화관마다 같은 영화, 시간은 살짝 다름), 상영관 ${SCREEN_NAMES.length}개/관, ` +
      `영화 ${MOVIES.length}개, 상영시간 총 ${showtimeCount}개`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
