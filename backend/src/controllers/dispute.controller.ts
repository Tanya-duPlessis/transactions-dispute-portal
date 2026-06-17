import { Request, Response } from 'express';
import { disputeService } from '../services/dispute.service';
import type { ListDisputesQuery } from '../validators/dispute.validators';

export const disputeController = {
  async create(req: Request, res: Response) {
    const transactionId = Array.isArray(req.params.transactionId)
      ? req.params.transactionId[0]
      : req.params.transactionId;
    const dispute = await disputeService.create(transactionId, req.user!.userId, req.body);
    res.status(201).json(dispute);
  },

  async list(req: Request, res: Response) {
    const query = req.query as Record<string, string>;
    const isAdmin = req.user!.role === 'ADMIN';
    const result = await disputeService.list(
      {
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? Math.min(parseInt(query.limit), 100) : 20,
        status: query.status as ListDisputesQuery['status'],
      },
      isAdmin ? undefined : req.user!.userId,
    );
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dispute = await disputeService.getById(id, req.user!.userId, req.user!.role === 'ADMIN');
    res.json(dispute);
  },

  async updateStatus(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dispute = await disputeService.updateStatus(id, req.user!.userId, req.body);
    res.json(dispute);
  },
};
