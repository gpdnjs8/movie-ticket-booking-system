import { prisma } from "../../infra/prisma";

export const reservationRepository = {
  findSeatsInScreen(screenId: bigint, seatIds: bigint[]) {
    return prisma.seat.findMany({
      where: { screenId, id: { in: seatIds } },
      select: { id: true, row: true, number: true },
    });
  },
  findBookedSeatIds(showtimeId: bigint, seatIds: bigint[]) {
    return prisma.reservationSeat.findMany({
      where: { showtimeId, seatId: { in: seatIds } },
      select: { seatId: true },
    });
  },

  createWithSeats(params: {
    userId: bigint;
    showtimeId: bigint;
    screenId: bigint;
    totalPrice: number;
    seatIds: bigint[];
  }) {
    const { userId, showtimeId, screenId, totalPrice, seatIds } = params;

    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: { userId, showtimeId, totalPrice },
      });

      await tx.reservationSeat.createMany({
        data: seatIds.map((seatId) => ({
          reservationId: reservation.id,
          showtimeId,
          seatId,
          screenId,
        })),
      });

      return reservation;
    });
  },

  findByUserId(userId: bigint, { cursor, take }: { cursor?: bigint; take: number }) {
    return prisma.reservation.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: take + 1,
      ...(cursor !== undefined ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        showtime: { include: { movie: true, screen: { include: { theater: true } } } },
        seats: { include: { seat: true } },
      },
    });
  },
};
