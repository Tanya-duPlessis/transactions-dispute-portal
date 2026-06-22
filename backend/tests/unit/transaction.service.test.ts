jest.mock('../../src/repositories/transaction.repository');

import { transactionService } from '../../src/services/transaction.service';
import { transactionRepository } from '../../src/repositories/transaction.repository';
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

beforeEach(() => jest.clearAllMocks());

describe('transactionService.getById', () => {
  it('returns transaction when found', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(mockTransaction);

    const result = await transactionService.getById('txn-1', 'user-1');

    expect(result).toEqual(mockTransaction);
    expect(transactionRepository.findById).toHaveBeenCalledWith('txn-1', 'user-1');
  });

  it('throws NOT_FOUND when transaction does not exist', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(transactionService.getById('txn-999', 'user-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('does not return transactions belonging to another user', async () => {
    (transactionRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(transactionService.getById('txn-1', 'other-user')).rejects.toThrow(AppError);
  });
});

describe('transactionService.list', () => {
  it('returns paginated results', async () => {
    const mockResult = {
      data: [mockTransaction],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    (transactionRepository.findMany as jest.Mock).mockResolvedValue(mockResult);

    const result = await transactionService.list('user-1', {
      page: 1,
      limit: 20,
    });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('passes search and category filters to repository', async () => {
    const mockResult = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    (transactionRepository.findMany as jest.Mock).mockResolvedValue(mockResult);

    await transactionService.list('user-1', {
      page: 1,
      limit: 20,
      search: 'Checkers',
      category: 'FOOD',
    });

    expect(transactionRepository.findMany).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ search: 'Checkers', category: 'FOOD' }),
    );
  });
});
