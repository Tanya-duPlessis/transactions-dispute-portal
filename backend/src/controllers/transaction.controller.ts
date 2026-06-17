import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import type { ListTransactionsQuery } from '../validators/transaction.validators';

export const transactionController = {
  async list(req: Request, res: Response) {
    const query = req.query as Record<string, string>;
    const result = await transactionService.list(req.user!.userId, {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? Math.min(parseInt(query.limit), 100) : 20,
      search: query.search,
      category: query.category as ListTransactionsQuery['category'],
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const transaction = await transactionService.getById(id, req.user!.userId);
    res.json(transaction);
  },
};
