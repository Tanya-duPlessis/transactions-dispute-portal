import { DisputeStatus, DisputeReason } from '@prisma/client';
import { disputeRepository } from '../repositories/dispute.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';
import { sendDisputeConfirmationEmail, sendStatusUpdateEmail } from '../utils/notifications';
import type { CreateDisputeInput, ListDisputesQuery, UpdateDisputeStatusInput } from '../validators/dispute.validators';

// Valid state machine transitions — only these are allowed
const VALID_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  PENDING: [DisputeStatus.UNDER_REVIEW],
  UNDER_REVIEW: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED],
  RESOLVED: [],
  REJECTED: [],
};

export const disputeService = {
  async create(transactionId: string, userId: string, input: CreateDisputeInput) {
    const transaction = await transactionRepository.findById(transactionId, userId);
    if (!transaction) {
      throw new AppError('NOT_FOUND', 'Transaction not found', 404);
    }

    const existing = await disputeRepository.findByTransactionId(transactionId);
    if (existing) {
      throw new AppError('DISPUTE_ALREADY_EXISTS', 'A dispute already exists for this transaction', 409);
    }

    const dispute = await disputeRepository.create({
      transactionId,
      userId,
      reason: input.reason as DisputeReason,
      description: input.description,
      actorId: userId,
    });

    const user = await userRepository.findById(userId);
    if (user) {
      sendDisputeConfirmationEmail(user.email, user.name, dispute.id);
    }

    return dispute;
  },

  async list(query: ListDisputesQuery, userId?: string) {
    return disputeRepository.findMany(query, userId);
  },

  async getById(id: string, requestingUserId: string, isAdmin: boolean) {
    const dispute = await disputeRepository.findById(id);
    if (!dispute) {
      throw new AppError('NOT_FOUND', 'Dispute not found', 404);
    }
    if (!isAdmin && dispute.userId !== requestingUserId) {
      throw new AppError('FORBIDDEN', 'Access denied', 403);
    }
    return dispute;
  },

  async updateStatus(disputeId: string, actorId: string, input: UpdateDisputeStatusInput) {
    const dispute = await disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new AppError('NOT_FOUND', 'Dispute not found', 404);
    }

    const allowedNext = VALID_TRANSITIONS[dispute.status];
    const toStatus = input.status as DisputeStatus;

    if (!allowedNext.includes(toStatus)) {
      throw new AppError(
        'INVALID_TRANSITION',
        `Cannot transition dispute from ${dispute.status} to ${input.status}`,
        400,
      );
    }

    const updated = await disputeRepository.updateStatus({
      disputeId,
      fromStatus: dispute.status,
      toStatus,
      note: input.note,
      actorId,
    });

    const user = await userRepository.findById(dispute.userId);
    if (user) {
      sendStatusUpdateEmail(user.email, user.name, disputeId, input.status);
    }

    return updated;
  },
};
