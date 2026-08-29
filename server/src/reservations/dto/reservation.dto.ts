import { z } from "zod";
import { cursorQuerySchema } from "../../common/pagination";

const seatIdSchema = z.string().regex(/^\d+$/, "seatId는 숫자 문자열이어야 합니다.");

export const createReservationSchema = z.object({
  showtimeId: z.string().regex(/^\d+$/, "showtimeId는 숫자 문자열이어야 합니다."),
  seatIds: z
    .array(seatIdSchema)
    .min(1, "좌석을 1개 이상 선택해야 합니다.")
    .max(6, "좌석은 최대 6개까지 선택할 수 있습니다.")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "중복된 좌석은 선택할 수 없습니다.",
    }),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>;

export const myReservationsQuerySchema = cursorQuerySchema;
export type MyReservationsQueryDto = z.infer<typeof myReservationsQuerySchema>;

export interface ReservationSeatItemDto {
  seatId: string;
  row: string;
  number: number;
}

export interface CreateReservationResponseDto {
  id: string;
  showtimeId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  seats: ReservationSeatItemDto[];
}

export interface MyReservationItemDto {
  id: string;
  showtimeId: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  startAt: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  seats: ReservationSeatItemDto[];
}
