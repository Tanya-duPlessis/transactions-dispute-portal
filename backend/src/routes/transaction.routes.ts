import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { disputeController } from '../controllers/dispute.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { validateUuid } from '../middleware/validateUuid';
import { listTransactionsSchema } from '../validators/transaction.validators';
import { createDisputeSchema } from '../validators/dispute.validators';

export const transactionRoutes = Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get paginated list of transactions for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by merchant name
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [FOOD, TRANSPORT, SHOPPING, ENTERTAINMENT, UTILITIES, OTHER] }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Paginated transaction list
 *       401:
 *         description: Unauthorised
 */
transactionRoutes.get('/', authenticate, validate(listTransactionsSchema), transactionController.list);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a single transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
transactionRoutes.get('/:id', authenticate, validateUuid('id'), transactionController.getById);

/**
 * @swagger
 * /transactions/{id}/disputes:
 *   post:
 *     summary: Raise a dispute for a transaction
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason, description]
 *             properties:
 *               reason: { type: string, enum: [UNAUTHORISED, DUPLICATE, INCORRECT_AMOUNT, SERVICE_NOT_RECEIVED, OTHER] }
 *               description: { type: string, minLength: 10 }
 *     responses:
 *       201:
 *         description: Dispute created
 *       409:
 *         description: Dispute already exists for this transaction
 */
transactionRoutes.post(
  '/:transactionId/disputes',
  authenticate,
  validateUuid('transactionId'),
  validate(createDisputeSchema),
  disputeController.create,
);
