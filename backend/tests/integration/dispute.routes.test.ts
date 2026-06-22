import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

let customerToken: string;
let adminToken: string;
let transactionId: string;

beforeAll(async () => {
  await prisma.disputeEvent.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 4); // low rounds for test speed

  const customer = await prisma.user.create({
    data: { email: 'customer@dispute-test.com', name: 'Customer', passwordHash: hash, role: 'CUSTOMER' },
  });

  await prisma.user.create({
    data: { email: 'admin@dispute-test.com', name: 'Admin', passwordHash: hash, role: 'ADMIN' },
  });

  const tx = await prisma.transaction.create({
    data: {
      userId: customer.id,
      reference: 'TXN-TEST-0001',
      amount: 500,
      merchant: 'Checkers',
      category: 'FOOD',
      date: new Date(),
      description: 'Test transaction',
    },
  });
  transactionId = tx.id;

  const customerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'customer@dispute-test.com', password: 'password123' });
  customerToken = customerRes.body.accessToken;

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@dispute-test.com', password: 'password123' });
  adminToken = adminRes.body.accessToken;
});

afterAll(async () => {
  await prisma.disputeEvent.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/v1/transactions/:id/disputes', () => {
  it('creates a dispute for a valid transaction', async () => {
    const res = await request(app)
      .post(`/api/v1/transactions/${transactionId}/disputes`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'UNAUTHORISED', description: 'I did not make this transaction at all.' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.transactionId).toBe(transactionId);
  });

  it('returns 409 when dispute already exists for transaction', async () => {
    const res = await request(app)
      .post(`/api/v1/transactions/${transactionId}/disputes`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'DUPLICATE', description: 'Trying to dispute again.' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DISPUTE_ALREADY_EXISTS');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post(`/api/v1/transactions/${transactionId}/disputes`)
      .send({ reason: 'UNAUTHORISED', description: 'No auth.' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/disputes', () => {
  it('returns disputes for the authenticated customer', async () => {
    const res = await request(app)
      .get('/api/v1/disputes')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('admin sees all disputes', async () => {
    const res = await request(app)
      .get('/api/v1/disputes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });
});

describe('PATCH /api/v1/disputes/:id/status', () => {
  let disputeId: string;

  beforeAll(async () => {
    // Create a fresh dispute specifically for status transition tests
    const freshTx = await prisma.transaction.create({
      data: {
        userId: (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))!.id,
        reference: 'TXN-TEST-STATUS-001',
        amount: 100,
        merchant: 'Test Merchant',
        category: 'OTHER',
        date: new Date(),
        description: 'Status test transaction',
      },
    });
    const dispute = await prisma.dispute.create({
      data: {
        transactionId: freshTx.id,
        userId: (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))!.id,
        reason: 'OTHER',
        description: 'Status transition test dispute.',
        status: 'PENDING',
      },
    });
    disputeId = dispute.id;
  });

  it('admin can advance dispute to UNDER_REVIEW', async () => {
    const res = await request(app)
      .patch(`/api/v1/disputes/${disputeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'UNDER_REVIEW', note: 'Reviewing the dispute now.' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UNDER_REVIEW');
  });

  it('customer cannot update dispute status', async () => {
    const res = await request(app)
      .patch(`/api/v1/disputes/${disputeId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'RESOLVED', note: 'Customer trying to resolve own dispute.' });

    expect(res.status).toBe(403);
  });

  it('admin cannot make an invalid state transition', async () => {
    const res = await request(app)
      .patch(`/api/v1/disputes/${disputeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PENDING', note: 'Invalid transition from UNDER_REVIEW.' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });
});
