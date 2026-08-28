import { AppError } from "../../errors/error";
import {
  MovieShowtimesQueryDto,
  MovieShowtimesResponseDto,
  TheaterShowtimesDto,
} from "../dto/showtime.dto";
import { movieRepository } from "../repository/movie.repository";
import { showtimeRepository } from "../repository/showtime.repository";

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const showtimeService = {
  async listByMovie(
    movieId: bigint,
    query: MovieShowtimesQueryDto
  ): Promise<MovieShowtimesResponseDto> {
    const movie = await movieRepository.findById(movieId);
    if (!movie) {
      throw AppError.notFound("영화를 찾을 수 없습니다.", "MOVIE_NOT_FOUND");
    }

    const date = query.date ?? todayDateString();
    const theaterId = query.theaterId ? BigInt(query.theaterId) : undefined;

    const rows = await showtimeRepository.findByMovieId(movieId, { date, theaterId });

    const theaterMap = new Map<string, TheaterShowtimesDto>();
    for (const row of rows) {
      const theaterId = row.screen.theater.id.toString();
      let theater = theaterMap.get(theaterId);
      if (!theater) {
        theater = { theaterId, theaterName: row.screen.theater.name, showtimes: [] };
        theaterMap.set(theaterId, theater);
      }

      theater.showtimes.push({
        id: row.id.toString(),
        screenName: row.screen.name,
        startAt: row.startAt.toISOString(),
        endAt: row.endAt.toISOString(),
        price: row.price,
      });
    }

    return { theaters: Array.from(theaterMap.values()) };
  },
};
