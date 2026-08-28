import { z } from "zod";
import { cursorQuerySchema } from "../../common/pagination";

export const movieListQuerySchema = cursorQuerySchema;

export type MovieListQueryDto = z.infer<typeof movieListQuerySchema>;

export interface MovieListItemDto {
  id: string;
  title: string;
  genre: string;
  runtimeMin: number;
  score: string;
  releaseDate: string | null;
  posterUrl: string | null;
}
