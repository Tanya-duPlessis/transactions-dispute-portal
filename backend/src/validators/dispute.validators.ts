import { z } from 'zod';

export const createDisputeSchema = z.object({
  body: z.object({
    reason: z.enum([
      'UNAUTHORISED',
      'DUPLICATE',
      'INCORRECT_AMOUNT',
      'SERVICE_NOT_RECEIVED',
      'OTHER',
    ]),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  }),
});

export const listDisputesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
    status: z
      .enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'])
      .optional(),
  }),
});

export const updateDisputeStatusSchema = z.object({
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'REJECTED']),
    note: z.string().min(5, 'Note must be at least 5 characters').max(500),
  }),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>['body'];
export type ListDisputesQuery = z.infer<typeof listDisputesSchema>['query'];
export type UpdateDisputeStatusInput = z.infer<typeof updateDisputeStatusSchema>['body'];
