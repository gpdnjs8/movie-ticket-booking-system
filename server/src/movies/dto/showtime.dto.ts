import { z } from "zod";

export const movieIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id는 숫자 문자열이어야 합니다."),
});

export type MovieIdParamDto = z.infer<typeof movieIdParamSchema>;

export const movieShowtimesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date는 YYYY-MM-DD 형식이어야 합니다.").optional(),
  theaterId: z.string().regex(/^\d+$/, "theaterId는 숫자 문자열이어야 합니다.").optional(),
});

export type MovieShowtimesQueryDto = z.infer<typeof movieShowtimesQuerySchema>;

export interface ShowtimeItemDto {
  id: string;
  screenName: string;
  startAt: string;
  endAt: string;
  price: number;
}

export interface TheaterShowtimesDto {
  theaterId: string;
  theaterName: string;
  showtimes: ShowtimeItemDto[];
}

export interface MovieShowtimesResponseDto {
  theaters: TheaterShowtimesDto[];
}
