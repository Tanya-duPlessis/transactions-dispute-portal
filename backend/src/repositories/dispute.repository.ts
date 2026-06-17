import { PrismaClient, DisputeStatus, DisputeReason } from '@prisma/client';
import type { ListDisputesQuery } from '../validators/dispute.validators';

const prisma = new PrismaClient();

export const disputeRepository = {
  async findMany(query: ListDisputesQuery, userId?: string) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(userId && { userId }),
      ...(status && { status }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.dispute.findMany({
        where,
        include: {
          transaction: true,
          user: { select: { id: true, name: true, email: true } },
          events: {
            orderBy: { createdAt: 'asc' },
            include: { actor: { select: { id: true, name: true, role: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  findById(id: string) {
    return prisma.dispute.findUnique({
      where: { id },
      include: {
        transaction: true,
        user: { select: { id: true, name: true, email: true } },
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, name: true, role: true } } },
        },
      },
    });
  },

  findByTransactionId(transactionId: string) {
    return prisma.dispute.findUnique({ where: { transactionId } });
  },

  async create(data: {
    transactionId: string;
    userId: string;
    reason: DisputeReason;
    description: string;
    actorId: string;
  }) {
    // ACID transaction: both Dispute and initial DisputeEvent are created atomically
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          transactionId: data.transactionId,
          userId: data.userId,
          reason: data.reason,
          description: data.description,
          status: DisputeStatus.PENDING,
        },
      });

      await tx.disputeEvent.create({
        data: {
          disputeId: dispute.id,
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.PENDING,
          note: 'Dispute submitted by customer.',
          actorId: data.actorId,
        },
      });

      return dispute;
    });
  },

  async updateStatus(data: {
    disputeId: string;
    fromStatus: DisputeStatus;
    toStatus: DisputeStatus;
    note: string;
    actorId: string;
  }) {
    // ACID transaction: status update and audit event created atomically
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.update({
        where: { id: data.disputeId },
        data: { status: data.toStatus },
      });

      await tx.disputeEvent.create({
        data: {
          disputeId: data.disputeId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          note: data.note,
          actorId: data.actorId,
        },
      });

      return dispute;
    });
  },
};
