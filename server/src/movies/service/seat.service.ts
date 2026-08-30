import { AppError } from "../../errors/error";
import { reservationRepository } from "../../reservations/repository/reservation.repository";
import { ShowtimeSeatsResponseDto } from "../dto/seat.dto";
import { seatRepository } from "../repository/seat.repository";
import { showtimeRepository } from "../repository/showtime.repository";

export const seatService = {
  async listByShowtime(
    showtimeId: bigint,
    userId: bigint | undefined
  ): Promise<ShowtimeSeatsResponseDto> {
    const showtime = await showtimeRepository.findById(showtimeId);
    if (!showtime) {
      throw AppError.notFound("상영 정보를 찾을 수 없습니다.", "SHOWTIME_NOT_FOUND");
    }

    const [seats, myReservedCount] = await Promise.all([
      seatRepository.findByScreenWithBookingStatus(showtime.screenId, showtimeId),
      userId !== undefined
        ? reservationRepository.countUserSeatsForShowtime(userId, showtimeId)
        : Promise.resolve(0),
    ]);

    return {
      showtimeId: showtimeId.toString(),
      price: showtime.price,
      myReservedCount,
      seats: seats.map((seat) => ({
        id: seat.id.toString(),
        row: seat.row,
        number: seat.number,
        isBooked: seat.reservationSeats.length > 0,
      })),
    };
  },
};
