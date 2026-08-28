import { prisma } from "../../infra/prisma";

function buildDateRange(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { start, end };
}

export const showtimeRepository = {
  findById(id: bigint) {
    return prisma.showtime.findUnique({ where: { id } });
  },

  findByMovieId(movieId: bigint, { date, theaterId }: { date: string; theaterId?: bigint }) {
    const { start, end } = buildDateRange(date);

    return prisma.showtime.findMany({
      where: {
        movieId,
        startAt: { gte: start, lt: end },
        screen: {
          deletedAt: null,
          theater: { deletedAt: null, ...(theaterId ? { id: theaterId } : {}) },
        },
      },
      include: { screen: { include: { theater: true } } },
      orderBy: { startAt: "asc" },
    });
  },
};
