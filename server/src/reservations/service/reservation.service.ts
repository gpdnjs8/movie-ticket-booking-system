import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/error";
import { buildCursorPage, CursorPageDto, DEFAULT_TAKE } from "../../common/pagination";
import { showtimeRepository } from "../../movies/repository/showtime.repository";
import { reservationRepository } from "../repository/reservation.repository";
import {
  CreateReservationDto,
  CreateReservationResponseDto,
  MyReservationItemDto,
  MyReservationsQueryDto,
} from "../dto/reservation.dto";

function isSeatUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export const reservationService = {
  async create(userId: bigint, input: CreateReservationDto): Promise<CreateReservationResponseDto> {
    const showtimeId = BigInt(input.showtimeId);
    const seatIds = input.seatIds.map((id) => BigInt(id));

    const showtime = await showtimeRepository.findById(showtimeId);
    if (!showtime) {
      throw AppError.notFound("상영 정보를 찾을 수 없습니다.", "SHOWTIME_NOT_FOUND");
    }

    const seats = await reservationRepository.findSeatsInScreen(showtime.screenId, seatIds);
    if (seats.length !== seatIds.length) {
      throw AppError.badRequest(
        "요청한 좌석 중 존재하지 않거나 해당 상영에 속하지 않는 좌석이 있습니다.",
        "INVALID_SEATS"
      );
    }

    const booked = await reservationRepository.findBookedSeatIds(showtimeId, seatIds);
    if (booked.length > 0) {
      throw AppError.conflict("이미 예약된 좌석이 포함되어 있습니다.", "SEAT_ALREADY_BOOKED");
    }

    const totalPrice = showtime.price * seatIds.length;

    let reservation;
    try {
      reservation = await reservationRepository.createWithSeats({
        userId,
        showtimeId,
        screenId: showtime.screenId,
        totalPrice,
        seatIds,
      });
    } catch (err) {
      if (isSeatUniqueConstraintError(err)) {
        throw AppError.conflict("이미 예약된 좌석이 포함되어 있습니다.", "SEAT_ALREADY_BOOKED");
      }
      throw err;
    }

    const seatById = new Map(seats.map((seat) => [seat.id.toString(), seat]));

    return {
      id: reservation.id.toString(),
      showtimeId: showtimeId.toString(),
      totalPrice,
      status: reservation.status,
      createdAt: reservation.createdAt.toISOString(),
      seats: seatIds.map((seatId) => {
        const seat = seatById.get(seatId.toString())!;
        return { seatId: seat.id.toString(), row: seat.row, number: seat.number };
      }),
    };
  },

  async listMine(
    userId: bigint,
    query: MyReservationsQueryDto
  ): Promise<CursorPageDto<MyReservationItemDto>> {
    const take = query.take ?? DEFAULT_TAKE;
    const cursor = query.cursor ? BigInt(query.cursor) : undefined;

    const rows = await reservationRepository.findByUserId(userId, { cursor, take });

    return buildCursorPage(rows, take, (row) => ({
      id: row.id.toString(),
      showtimeId: row.showtimeId.toString(),
      movieTitle: row.showtime.movie.title,
      theaterName: row.showtime.screen.theater.name,
      screenName: row.showtime.screen.name,
      startAt: row.showtime.startAt.toISOString(),
      totalPrice: row.totalPrice,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      seats: row.seats.map((s) => ({
        seatId: s.seat.id.toString(),
        row: s.seat.row,
        number: s.seat.number,
      })),
    }));
  },
};
