import { MovieListItem, Theater } from "../types/movie";
import { MovieShowtimesResponse } from "../types/showtime";
import { Seat } from "../types/seat";
import { MyReservationItem } from "../types/reservation";

const GENRES = ["액션", "로맨스", "코미디", "SF", "드라마", "애니메이션", "공포"];

export const MOCK_THEATERS: Theater[] = [
  { id: "1", name: "강남점" },
  { id: "2", name: "홍대점" },
  { id: "3", name: "잠실점" },
  { id: "4", name: "여의도점" },
];

export const MOCK_MOVIES: MovieListItem[] = Array.from({ length: 38 }, (_, i) => {
  const id = String(i + 1);
  return {
    id,
    title: `영화 제목 ${id}`,
    genre: GENRES[i % GENRES.length],
    runtimeMin: 90 + ((i * 7) % 60),
    score: (7 + ((i % 3) * 0.7)).toFixed(1),
    releaseDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-01`,
    posterUrl: null,
  };
});

function hashToHue(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

export function posterGradient(id: string): string {
  const hue = hashToHue(id);
  return `linear-gradient(160deg, hsl(${hue} 70% 35%), hsl(${(hue + 60) % 360} 70% 20%))`;
}

export function buildMockShowtimes(movieId: string): MovieShowtimesResponse {
  const seed = Number(movieId);
  return {
    theaters: MOCK_THEATERS.map((theater) => ({
      theaterId: theater.id,
      theaterName: theater.name,
      showtimes: ["09:30", "13:10", "16:50", "20:20"].map((time, i) => {
        const date = `2026-08-${String(29 + ((seed + i) % 3)).padStart(2, "0")}`;
        return {
          id: `${movieId}-${theater.id}-${i}`,
          screenName: `${(i % 4) + 1}관`,
          startAt: `${date}T${time}:00`,
          endAt: `${date}T${time}:00`,
          price: 14000,
        };
      }),
    })),
  };
}

const ROWS = ["A", "B", "C", "D", "E"];

export function buildMockSeats(showtimeId: string): Seat[] {
  const seed = showtimeId.length;
  const seats: Seat[] = [];
  ROWS.forEach((row, rowIndex) => {
    for (let number = 1; number <= 8; number += 1) {
      const bookedSeed = (rowIndex * 8 + number + seed) % 5;
      seats.push({
        id: `${showtimeId}-${row}${number}`,
        row,
        number,
        isBooked: bookedSeed === 0,
      });
    }
  });
  return seats;
}

export const MOCK_RESERVATIONS: MyReservationItem[] = [
  {
    id: "r1",
    showtimeId: "3-1-1",
    movieTitle: "영화 제목 3",
    theaterName: "강남점",
    screenName: "2관",
    startAt: "2026-08-30T13:10:00",
    totalPrice: 28000,
    status: "CONFIRMED",
    createdAt: "2026-08-27T10:00:00",
    seats: [
      { seatId: "s1", row: "B", number: 4 },
      { seatId: "s2", row: "B", number: 5 },
    ],
  },
];
