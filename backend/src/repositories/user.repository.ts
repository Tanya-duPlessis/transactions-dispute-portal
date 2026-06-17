import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { id } }),

  create: (data: { email: string; name: string; passwordHash: string }): Promise<User> =>
    prisma.user.create({ data }),
};
