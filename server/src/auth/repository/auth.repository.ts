import { prisma } from "../../infra/prisma";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email, deletedAt: null } });
  },

  findById(userId: bigint) {
    return prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  },

  create(data: { email: string; password: string; name: string }) {
    return prisma.user.create({ data });
  },
};
