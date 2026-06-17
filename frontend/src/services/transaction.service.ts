import api from './api';
import type { PaginatedResponse, Transaction } from '../types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const transactionService = {
  async list(filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    const { data } = await api.get(`/transactions?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },
};
