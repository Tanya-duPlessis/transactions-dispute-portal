import { transactionRepository } from '../repositories/transaction.repository';
import { AppError } from '../middleware/errorHandler';
import type { ListTransactionsQuery } from '../validators/transaction.validators';

export const transactionService = {
  async list(userId: string, query: ListTransactionsQuery) {
    return transactionRepository.findMany(userId, query);
  },

  async getById(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new AppError('NOT_FOUND', 'Transaction not found', 404);
    }
    return transaction;
  },
};
