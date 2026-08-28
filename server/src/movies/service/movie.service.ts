import { buildCursorPage, CursorPageDto, DEFAULT_TAKE } from "../../common/pagination";
import { MovieListItemDto, MovieListQueryDto } from "../dto/movie.dto";
import { movieRepository } from "../repository/movie.repository";

export const movieService = {
  async list(query: MovieListQueryDto): Promise<CursorPageDto<MovieListItemDto>> {
    const take = query.take ?? DEFAULT_TAKE;
    const cursor = query.cursor ? BigInt(query.cursor) : undefined;

    const rows = await movieRepository.findMany({ cursor, take });

    return buildCursorPage(rows, take, (row) => ({
      id: row.id.toString(),
      title: row.title,
      genre: row.genre,
      runtimeMin: row.runtimeMin,
      score: row.score.toString(),
      releaseDate: row.releaseDate ? row.releaseDate.toISOString().slice(0, 10) : null,
      posterUrl: row.posterUrl,
    }));
  },
};
