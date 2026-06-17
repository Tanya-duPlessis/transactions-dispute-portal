import api from './api';
import type { Dispute, PaginatedResponse } from '../types';

export const disputeService = {
  async list(params: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Dispute>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    const { data } = await api.get(`/disputes?${query.toString()}`);
    return data;
  },

  async getById(id: string): Promise<Dispute> {
    const { data } = await api.get(`/disputes/${id}`);
    return data;
  },

  async create(transactionId: string, reason: string, description: string): Promise<Dispute> {
    const { data } = await api.post(`/transactions/${transactionId}/disputes`, { reason, description });
    return data;
  },

  async updateStatus(id: string, status: string, note: string): Promise<Dispute> {
    const { data } = await api.patch(`/disputes/${id}/status`, { status, note });
    return data;
  },
};
