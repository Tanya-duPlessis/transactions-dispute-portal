import { PrismaClient, Role, Category, DisputeReason, DisputeStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const merchants = [
  { name: 'Checkers', category: Category.FOOD },
  { name: 'Pick n Pay', category: Category.FOOD },
  { name: 'Woolworths Food', category: Category.FOOD },
  { name: 'Uber Eats', category: Category.FOOD },
  { name: 'KFC', category: Category.FOOD },
  { name: 'Nando\'s', category: Category.FOOD },
  { name: 'Spur', category: Category.FOOD },
  { name: 'Steers', category: Category.FOOD },
  { name: 'Uber', category: Category.TRANSPORT },
  { name: 'Bolt', category: Category.TRANSPORT },
  { name: 'Gautrain', category: Category.TRANSPORT },
  { name: 'ParkPlane', category: Category.TRANSPORT },
  { name: 'Shell Garage', category: Category.TRANSPORT },
  { name: 'BP Express', category: Category.TRANSPORT },
  { name: 'Engen', category: Category.TRANSPORT },
  { name: 'Takealot', category: Category.SHOPPING },
  { name: 'Zara', category: Category.SHOPPING },
  { name: 'H&M', category: Category.SHOPPING },
  { name: 'Sportscene', category: Category.SHOPPING },
  { name: 'Clicks', category: Category.SHOPPING },
  { name: 'Woolworths', category: Category.SHOPPING },
  { name: 'Mr Price', category: Category.SHOPPING },
  { name: 'Truworths', category: Category.SHOPPING },
  { name: 'Foschini', category: Category.SHOPPING },
  { name: 'Netflix', category: Category.ENTERTAINMENT },
  { name: 'Spotify', category: Category.ENTERTAINMENT },
  { name: 'Steam', category: Category.ENTERTAINMENT },
  { name: 'Ster-Kinekor', category: Category.ENTERTAINMENT },
  { name: 'DStv', category: Category.ENTERTAINMENT },
  { name: 'Apple Music', category: Category.ENTERTAINMENT },
  { name: 'Eskom', category: Category.UTILITIES },
  { name: 'Telkom', category: Category.UTILITIES },
  { name: 'Vodacom', category: Category.UTILITIES },
  { name: 'MTN', category: Category.UTILITIES },
  { name: 'City of Johannesburg', category: Category.UTILITIES },
  { name: 'Cape Town City', category: Category.UTILITIES },
  { name: 'Nedbank Insurance', category: Category.OTHER },
  { name: 'Momentum', category: Category.OTHER },
  { name: 'Discovery Health', category: Category.OTHER },
];

const customers = [
  { name: 'Michelle Adler',              email: 'customer1@demo.com' },
  { name: 'Rynhardt Janse Van Rensburg', email: 'customer2@demo.com' },
  { name: 'Elmarie du Plessis',          email: 'customer3@demo.com' },
  { name: 'Mariette Adam',               email: 'customer4@demo.com' },
  { name: 'Elsebe Potgieter',            email: 'customer5@demo.com' },
  { name: 'Luan Chen',                   email: 'customer6@demo.com' },
  { name: 'Ziyaad Mohamed Adam',         email: 'customer7@demo.com' },
  { name: 'Lerato Mabusela',             email: 'customer8@demo.com' },
  { name: 'Bontle Mnisi',                email: 'customer9@demo.com' },
];

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

function randomMerchant() {
  return merchants[Math.floor(Math.random() * merchants.length)];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Seeding database...');

  await prisma.disputeEvent.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@demo.com', name: 'Admin User', passwordHash, role: Role.ADMIN },
  });

  const createdCustomers = await Promise.all(
    customers.map((c) =>
      prisma.user.create({
        data: { email: c.email, name: c.name, passwordHash, role: Role.CUSTOMER },
      }),
    ),
  );

  console.log('Created users');

  const createTransactions = async (userId: string, count: number) => {
    const txns = [];
    for (let i = 0; i < count; i++) {
      const merchant = randomMerchant();
      txns.push(
        await prisma.transaction.create({
          data: {
            userId,
            amount: randomAmount(20, 4500),
            merchant: merchant.name,
            category: merchant.category,
            date: randomDate(365),
            description: `Payment to ${merchant.name}`,
          },
        }),
      );
    }
    return txns;
  };

  // Each customer gets between 30 and 42 transactions (varied)
  const txnCounts = [42, 35, 38, 30, 33, 36, 31, 40, 34];
  const allTransactions = await Promise.all(
    createdCustomers.map((c, i) => createTransactions(c.id, txnCounts[i])),
  );

  console.log('Created transactions');

  const reasons = [
    DisputeReason.UNAUTHORISED,
    DisputeReason.DUPLICATE,
    DisputeReason.INCORRECT_AMOUNT,
    DisputeReason.SERVICE_NOT_RECEIVED,
    DisputeReason.OTHER,
  ];

  const descriptions: Record<string, string> = {
    UNAUTHORISED: 'I did not make this transaction. My card details may have been compromised.',
    DUPLICATE: 'This transaction appears twice on my statement for the same purchase.',
    INCORRECT_AMOUNT: 'The amount charged does not match what was agreed at the point of sale.',
    SERVICE_NOT_RECEIVED: 'I was charged for a service or product that was never delivered.',
    OTHER: 'I am disputing this transaction for reasons not listed above.',
  };

  // Build 23+ disputes spread across all customers and all statuses
  const disputeTemplates: Array<{
    customerIdx: number;
    txnIdx: number;
    reason: DisputeReason;
    status: DisputeStatus;
  }> = [
    { customerIdx: 0, txnIdx: 0, reason: DisputeReason.UNAUTHORISED,        status: DisputeStatus.PENDING },
    { customerIdx: 0, txnIdx: 1, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 0, txnIdx: 2, reason: DisputeReason.INCORRECT_AMOUNT,     status: DisputeStatus.RESOLVED },
    { customerIdx: 1, txnIdx: 0, reason: DisputeReason.SERVICE_NOT_RECEIVED, status: DisputeStatus.REJECTED },
    { customerIdx: 1, txnIdx: 1, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 1, txnIdx: 2, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.PENDING },
    { customerIdx: 2, txnIdx: 0, reason: DisputeReason.INCORRECT_AMOUNT,     status: DisputeStatus.RESOLVED },
    { customerIdx: 2, txnIdx: 1, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.PENDING },
    { customerIdx: 2, txnIdx: 2, reason: DisputeReason.OTHER,                status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 3, txnIdx: 0, reason: DisputeReason.SERVICE_NOT_RECEIVED, status: DisputeStatus.REJECTED },
    { customerIdx: 3, txnIdx: 1, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.RESOLVED },
    { customerIdx: 4, txnIdx: 0, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.PENDING },
    { customerIdx: 4, txnIdx: 1, reason: DisputeReason.INCORRECT_AMOUNT,     status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 4, txnIdx: 2, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.RESOLVED },
    { customerIdx: 5, txnIdx: 0, reason: DisputeReason.SERVICE_NOT_RECEIVED, status: DisputeStatus.PENDING },
    { customerIdx: 5, txnIdx: 1, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.REJECTED },
    { customerIdx: 6, txnIdx: 0, reason: DisputeReason.INCORRECT_AMOUNT,     status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 6, txnIdx: 1, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.RESOLVED },
    { customerIdx: 7, txnIdx: 0, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.PENDING },
    { customerIdx: 7, txnIdx: 1, reason: DisputeReason.SERVICE_NOT_RECEIVED, status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 7, txnIdx: 2, reason: DisputeReason.OTHER,                status: DisputeStatus.REJECTED },
    { customerIdx: 8, txnIdx: 0, reason: DisputeReason.DUPLICATE,            status: DisputeStatus.RESOLVED },
    { customerIdx: 8, txnIdx: 1, reason: DisputeReason.INCORRECT_AMOUNT,     status: DisputeStatus.PENDING },
    { customerIdx: 8, txnIdx: 2, reason: DisputeReason.UNAUTHORISED,         status: DisputeStatus.UNDER_REVIEW },
    { customerIdx: 0, txnIdx: 3, reason: DisputeReason.SERVICE_NOT_RECEIVED, status: DisputeStatus.RESOLVED },
    { customerIdx: 3, txnIdx: 2, reason: DisputeReason.OTHER,                status: DisputeStatus.PENDING },
  ];

  const reviewNote = (reason: string) =>
    pick([
      'Reviewing transaction records with the merchant.',
      'Requested supporting documentation from the customer.',
      'Escalated to the fraud investigation team.',
      'Awaiting confirmation from merchant.',
    ]);

  const resolveNote = () =>
    pick([
      'Confirmed invalid charge. Full refund processed.',
      'Merchant acknowledged billing error. Refund issued.',
      'Investigation complete. Funds returned to account.',
      'Charge confirmed as error. Credit applied.',
    ]);

  const rejectNote = () =>
    pick([
      'Merchant provided signed proof of delivery. Dispute rejected.',
      'Transaction confirmed as valid based on supporting evidence.',
      'Customer confirmed transaction after further investigation.',
      'Insufficient evidence to support the dispute claim.',
    ]);

  for (const t of disputeTemplates) {
    const userId = createdCustomers[t.customerIdx].id;
    const transaction = allTransactions[t.customerIdx][t.txnIdx];
    const reason = t.reason;
    const status = t.status;

    const dispute = await prisma.dispute.create({
      data: {
        transactionId: transaction.id,
        userId,
        reason,
        description: descriptions[reason],
        status,
      },
    });

    // Always create the initial submission event
    await prisma.disputeEvent.create({
      data: {
        disputeId: dispute.id,
        fromStatus: DisputeStatus.PENDING,
        toStatus: DisputeStatus.PENDING,
        note: 'Dispute submitted by customer.',
        actorId: userId,
      },
    });

    if (status === DisputeStatus.UNDER_REVIEW || status === DisputeStatus.RESOLVED || status === DisputeStatus.REJECTED) {
      await prisma.disputeEvent.create({
        data: {
          disputeId: dispute.id,
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.UNDER_REVIEW,
          note: reviewNote(reason),
          actorId: admin.id,
        },
      });
    }

    if (status === DisputeStatus.RESOLVED) {
      await prisma.disputeEvent.create({
        data: {
          disputeId: dispute.id,
          fromStatus: DisputeStatus.UNDER_REVIEW,
          toStatus: DisputeStatus.RESOLVED,
          note: resolveNote(),
          actorId: admin.id,
        },
      });
    }

    if (status === DisputeStatus.REJECTED) {
      await prisma.disputeEvent.create({
        data: {
          disputeId: dispute.id,
          fromStatus: DisputeStatus.UNDER_REVIEW,
          toStatus: DisputeStatus.REJECTED,
          note: rejectNote(),
          actorId: admin.id,
        },
      });
    }
  }

  console.log('Created disputes with audit trail');
  console.log('');
  console.log('Seed complete. Login credentials:');
  console.log('  customer1@demo.com  (Michelle Adler)              / password123');
  console.log('  customer2@demo.com  (Rynhardt Janse Van Rensburg) / password123');
  console.log('  customer3@demo.com  (Elmarie du Plessis)          / password123');
  console.log('  customer4@demo.com  (Mariette Adam)               / password123');
  console.log('  customer5@demo.com  (Elsebe Potgieter)            / password123');
  console.log('  customer6@demo.com  (Luan Chen)                   / password123');
  console.log('  customer7@demo.com  (Ziyaad Mohamed Adam)         / password123');
  console.log('  customer8@demo.com  (Lerato Mabusela)             / password123');
  console.log('  customer9@demo.com  (Bontle Mnisi)                / password123');
  console.log('  admin@demo.com      (Admin)                       / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
