import { Router } from 'express';
import { disputeController } from '../controllers/dispute.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { validateUuid } from '../middleware/validateUuid';
import {
  createDisputeSchema,
  listDisputesSchema,
  updateDisputeStatusSchema,
} from '../validators/dispute.validators';

export const disputeRoutes = Router();

/**
 * @swagger
 * /disputes:
 *   get:
 *     summary: List disputes (customers see own, admins see all)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, UNDER_REVIEW, RESOLVED, REJECTED] }
 *     responses:
 *       200:
 *         description: Paginated dispute list
 */
disputeRoutes.get('/', authenticate, validate(listDisputesSchema), disputeController.list);

/**
 * @swagger
 * /disputes/{id}:
 *   get:
 *     summary: Get dispute by ID with full audit trail
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Dispute with events timeline
 *       404:
 *         description: Dispute not found
 */
disputeRoutes.get('/:id', authenticate, validateUuid('id'), disputeController.getById);

/**
 * @swagger
 * /disputes/{id}/status:
 *   patch:
 *     summary: Update dispute status (admin only)
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
 *             required: [status, note]
 *             properties:
 *               status: { type: string, enum: [UNDER_REVIEW, RESOLVED, REJECTED] }
 *               note: { type: string, minLength: 5 }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid state transition
 *       403:
 *         description: Admin access required
 */
disputeRoutes.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validateUuid('id'),
  validate(updateDisputeStatusSchema),
  disputeController.updateStatus,
);
