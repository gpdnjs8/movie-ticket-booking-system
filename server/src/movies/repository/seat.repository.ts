import { prisma } from "../../infra/prisma";

export const seatRepository = {
  findByScreenWithBookingStatus(screenId: bigint, showtimeId: bigint) {
    return prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ row: "asc" }, { number: "asc" }],
      include: {
        reservationSeats: {
          where: { showtimeId },
          select: { id: true },
        },
      },
    });
  },
};
