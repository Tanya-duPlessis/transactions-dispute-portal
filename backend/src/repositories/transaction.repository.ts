import { PrismaClient, Category } from '@prisma/client';
import type { ListTransactionsQuery } from '../validators/transaction.validators';

const prisma = new PrismaClient();

export const transactionRepository = {
  async findMany(userId: string, query: ListTransactionsQuery) {
    const { page, limit, search, category, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search && {
        merchant: { contains: search, mode: 'insensitive' as const },
      }),
      ...(category && { category: category as Category }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: { dispute: { select: { id: true, status: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { dispute: true },
    });
  },
};
