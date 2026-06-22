import { DisputeStatus, DisputeReason } from '@prisma/client';

// Mock all repositories before importing the service
jest.mock('../../src/repositories/dispute.repository');
jest.mock('../../src/repositories/transaction.repository');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/notifications');

import { disputeService } from '../../src/services/dispute.service';
import { disputeRepository } from '../../src/repositories/dispute.repository';
import { transactionRepository } from '../../src/repositories/transaction.repository';
import { userRepository } from '../../src/repositories/user.repository';
import { AppError } from '../../src/middleware/errorHandler';

const mockTransaction = {
  id: 'txn-1',
  userId: 'user-1',
  reference: 'TXN-00000001',
  amount: '500.00' as unknown as import('@prisma/client').Prisma.Decimal,
  merchant: 'Checkers',
  category: 'FOOD' as import('@prisma/client').Category,
  date: new Date(),
  description: 'Payment to Checkers',
  createdAt: new Date(),
  dispute: null,
};

const mockUser = {
  id: 'user-1',
  email: 'test@demo.com',
  name: 'Test User',
  passwordHash: 'hash',
  role: 'CUSTOMER' as import('@prisma/client').Role,
  createdAt: new Date(),
};

const mockDispute = {
  id: 'dispute-1',
  transactionId: 'txn-1',
  userId: 'user-1',
  reason: DisputeReason.UNAUTHORISED,
  description: 'I did not make this transaction.',
  status: DisputeStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('disputeService.create', () => {
  it('creates a dispute when transaction exists and has no dispute', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(mockTransaction);
    (disputeRepository.findByTransactionId as jest.Mock).mockResolvedValue(null);
    (disputeRepository.create as jest.Mock).mockResolvedValue(mockDispute);
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await disputeService.create('txn-1', 'user-1', {
      reason: DisputeReason.UNAUTHORISED,
      description: 'I did not make this transaction.',
    });

    expect(result).toEqual(mockDispute);
    expect(disputeRepository.create).toHaveBeenCalledTimes(1);
  });

  it('throws NOT_FOUND when transaction does not exist', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      disputeService.create('txn-999', 'user-1', {
        reason: DisputeReason.UNAUTHORISED,
        description: 'Test.',
      }),
    ).rejects.toThrow(AppError);

    await expect(
      disputeService.create('txn-999', 'user-1', {
        reason: DisputeReason.UNAUTHORISED,
        description: 'Test.',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws DISPUTE_ALREADY_EXISTS when dispute already exists for transaction', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(mockTransaction);
    (disputeRepository.findByTransactionId as jest.Mock).mockResolvedValue(mockDispute);

    await expect(
      disputeService.create('txn-1', 'user-1', {
        reason: DisputeReason.DUPLICATE,
        description: 'Duplicate charge.',
      }),
    ).rejects.toMatchObject({ code: 'DISPUTE_ALREADY_EXISTS' });
  });
});

describe('disputeService.updateStatus — state machine', () => {
  it('allows PENDING → UNDER_REVIEW', async () => {
    const pendingDispute = { ...mockDispute, status: DisputeStatus.PENDING };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(pendingDispute);
    (disputeRepository.updateStatus as jest.Mock).mockResolvedValue({
      ...pendingDispute,
      status: DisputeStatus.UNDER_REVIEW,
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await disputeService.updateStatus('dispute-1', 'admin-1', {
      status: DisputeStatus.UNDER_REVIEW,
      note: 'Reviewing now.',
    });

    expect(result.status).toBe(DisputeStatus.UNDER_REVIEW);
  });

  it('allows UNDER_REVIEW → RESOLVED', async () => {
    const reviewDispute = { ...mockDispute, status: DisputeStatus.UNDER_REVIEW };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(reviewDispute);
    (disputeRepository.updateStatus as jest.Mock).mockResolvedValue({
      ...reviewDispute,
      status: DisputeStatus.RESOLVED,
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await disputeService.updateStatus('dispute-1', 'admin-1', {
      status: DisputeStatus.RESOLVED,
      note: 'Resolved.',
    });

    expect(result.status).toBe(DisputeStatus.RESOLVED);
  });

  it('allows UNDER_REVIEW → REJECTED', async () => {
    const reviewDispute = { ...mockDispute, status: DisputeStatus.UNDER_REVIEW };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(reviewDispute);
    (disputeRepository.updateStatus as jest.Mock).mockResolvedValue({
      ...reviewDispute,
      status: DisputeStatus.REJECTED,
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await disputeService.updateStatus('dispute-1', 'admin-1', {
      status: DisputeStatus.REJECTED,
      note: 'Rejected.',
    });

    expect(result.status).toBe(DisputeStatus.REJECTED);
  });

  it('allows RESOLVED → PENDING (re-open)', async () => {
    const resolvedDispute = { ...mockDispute, status: DisputeStatus.RESOLVED };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(resolvedDispute);
    (disputeRepository.updateStatus as jest.Mock).mockResolvedValue({
      ...resolvedDispute,
      status: DisputeStatus.PENDING,
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await disputeService.updateStatus('dispute-1', 'admin-1', {
      status: DisputeStatus.PENDING,
      note: 'Re-opening for new evidence.',
    });

    expect(result.status).toBe(DisputeStatus.PENDING);
  });

  it('throws INVALID_TRANSITION for PENDING → RESOLVED (skipping UNDER_REVIEW)', async () => {
    const pendingDispute = { ...mockDispute, status: DisputeStatus.PENDING };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(pendingDispute);

    await expect(
      disputeService.updateStatus('dispute-1', 'admin-1', {
        status: DisputeStatus.RESOLVED,
        note: 'Trying to skip.',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
  });

  it('throws INVALID_TRANSITION for REJECTED → UNDER_REVIEW', async () => {
    const rejectedDispute = { ...mockDispute, status: DisputeStatus.REJECTED };
    (disputeRepository.findById as jest.Mock).mockResolvedValue(rejectedDispute);

    await expect(
      disputeService.updateStatus('dispute-1', 'admin-1', {
        status: DisputeStatus.UNDER_REVIEW,
        note: 'Invalid.',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
  });
});
