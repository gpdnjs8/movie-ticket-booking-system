import { prisma } from "../../infra/prisma";

export const movieRepository = {
  findById(id: bigint) {
    return prisma.movie.findUnique({ where: { id, deletedAt: null } });
  },

  findMany({ cursor, take }: { cursor?: bigint; take: number }) {
    return prisma.movie.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },
};
