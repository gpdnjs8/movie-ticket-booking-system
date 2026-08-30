import { z } from "zod";

export const showtimeIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id는 숫자 문자열이어야 합니다."),
});

export type ShowtimeIdParamDto = z.infer<typeof showtimeIdParamSchema>;

export interface SeatItemDto {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

export interface ShowtimeSeatsResponseDto {
  showtimeId: string;
  price: number;
  myReservedCount: number;
  seats: SeatItemDto[];
}
