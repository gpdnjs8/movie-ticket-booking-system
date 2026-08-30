import { AppError } from "../../errors/error";
import { ShowtimeSeatsResponseDto } from "../dto/seat.dto";
import { seatRepository } from "../repository/seat.repository";
import { showtimeRepository } from "../repository/showtime.repository";

export const seatService = {
  async listByShowtime(showtimeId: bigint): Promise<ShowtimeSeatsResponseDto> {
    const showtime = await showtimeRepository.findById(showtimeId);
    if (!showtime) {
      throw AppError.notFound("상영 정보를 찾을 수 없습니다.", "SHOWTIME_NOT_FOUND");
    }

    const seats = await seatRepository.findByScreenWithBookingStatus(
      showtime.screenId,
      showtimeId
    );

    return {
      showtimeId: showtimeId.toString(),
      price: showtime.price,
      seats: seats.map((seat) => ({
        id: seat.id.toString(),
        row: seat.row,
        number: seat.number,
        isBooked: seat.reservationSeats.length > 0,
      })),
    };
  },
};
