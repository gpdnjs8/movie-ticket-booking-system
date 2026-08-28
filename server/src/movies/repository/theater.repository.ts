import { prisma } from "../../infra/prisma";

export const theaterRepository = {
  findMany({ cursor, take }: { cursor?: bigint; take: number }) {
    return prisma.theater.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },
};
