import { z } from 'zod';

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
    search: z.string().optional(),
    category: z.enum(['FOOD', 'TRANSPORT', 'SHOPPING', 'ENTERTAINMENT', 'UTILITIES', 'OTHER']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema>['query'];
