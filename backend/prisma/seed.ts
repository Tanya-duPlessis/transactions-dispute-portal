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
  { name: 'Uber', category: Category.TRANSPORT },
  { name: 'Bolt', category: Category.TRANSPORT },
  { name: 'Gautrain', category: Category.TRANSPORT },
  { name: 'ParkPlane', category: Category.TRANSPORT },
  { name: 'Shell Garage', category: Category.TRANSPORT },
  { name: 'BP Express', category: Category.TRANSPORT },
  { name: 'Takealot', category: Category.SHOPPING },
  { name: 'Zara', category: Category.SHOPPING },
  { name: 'H&M', category: Category.SHOPPING },
  { name: 'Sportscene', category: Category.SHOPPING },
  { name: 'Clicks', category: Category.SHOPPING },
  { name: 'Woolworths', category: Category.SHOPPING },
  { name: 'Mr Price', category: Category.SHOPPING },
  { name: 'Netflix', category: Category.ENTERTAINMENT },
  { name: 'Spotify', category: Category.ENTERTAINMENT },
  { name: 'Steam', category: Category.ENTERTAINMENT },
  { name: 'Ster-Kinekor', category: Category.ENTERTAINMENT },
  { name: 'DStv', category: Category.ENTERTAINMENT },
  { name: 'Eskom', category: Category.UTILITIES },
  { name: 'Telkom', category: Category.UTILITIES },
  { name: 'Vodacom', category: Category.UTILITIES },
  { name: 'MTN', category: Category.UTILITIES },
  { name: 'City of Johannesburg', category: Category.UTILITIES },
  { name: 'Cape Town City', category: Category.UTILITIES },
];

const customers = [
  { name: 'Michelle Adler',               email: 'customer1@demo.com' },
  { name: 'Rynhardt Janse Van Rensburg',  email: 'customer2@demo.com' },
  { name: 'Elmarie du Plessis',           email: 'customer3@demo.com' },
  { name: 'Mariette Adam',                email: 'customer4@demo.com' },
  { name: 'Elsebe Potgieter',             email: 'customer5@demo.com' },
  { name: 'Luan Chen',                    email: 'customer6@demo.com' },
  { name: 'Ziyaad Mohamed Adam',          email: 'customer7@demo.com' },
  { name: 'Lerato Mabusela',              email: 'customer8@demo.com' },
  { name: 'Bontle Mnisi',                 email: 'customer9@demo.com' },
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
            amount: randomAmount(20, 3500),
            merchant: merchant.name,
            category: merchant.category,
            date: randomDate(180),
            description: `Payment to ${merchant.name}`,
          },
        }),
      );
    }
    return txns;
  };

  // 23 transactions total, unevenly distributed across 9 customers
  const txnCounts = [4, 3, 3, 2, 3, 2, 2, 2, 2]; // sums to 23
  const allTransactions = await Promise.all(
    createdCustomers.map((c, i) => createTransactions(c.id, txnCounts[i])),
  );

  console.log('Created transactions');

  // Pre-seed disputes across multiple customers in all states
  const disputeSeeds = [
    {
      transaction: allTransactions[0][0],
      userId: createdCustomers[0].id,
      reason: DisputeReason.UNAUTHORISED,
      description: 'I did not make this transaction. My card may have been compromised.',
      status: DisputeStatus.PENDING,
      events: [],
    },
    {
      transaction: allTransactions[0][1],
      userId: createdCustomers[0].id,
      reason: DisputeReason.DUPLICATE,
      description: 'This transaction appears twice on my statement for the same purchase.',
      status: DisputeStatus.UNDER_REVIEW,
      events: [
        { fromStatus: DisputeStatus.PENDING, toStatus: DisputeStatus.UNDER_REVIEW, note: 'Dispute received and assigned to the review team.', actorId: admin.id },
      ],
    },
    {
      transaction: allTransactions[1][0],
      userId: createdCustomers[1].id,
      reason: DisputeReason.INCORRECT_AMOUNT,
      description: 'I was charged R850 but my receipt clearly shows R350.',
      status: DisputeStatus.RESOLVED,
      events: [
        { fromStatus: DisputeStatus.PENDING, toStatus: DisputeStatus.UNDER_REVIEW, note: 'Reviewing transaction records with the merchant.', actorId: admin.id },
        { fromStatus: DisputeStatus.UNDER_REVIEW, toStatus: DisputeStatus.RESOLVED, note: 'Confirmed incorrect charge. Refund of R500 processed to account.', actorId: admin.id },
      ],
    },
    {
      transaction: allTransactions[2][0],
      userId: createdCustomers[2].id,
      reason: DisputeReason.SERVICE_NOT_RECEIVED,
      description: 'Order was never delivered but I was charged the full amount.',
      status: DisputeStatus.REJECTED,
      events: [
        { fromStatus: DisputeStatus.PENDING, toStatus: DisputeStatus.UNDER_REVIEW, note: 'Contacted merchant for delivery confirmation.', actorId: admin.id },
        { fromStatus: DisputeStatus.UNDER_REVIEW, toStatus: DisputeStatus.REJECTED, note: 'Merchant provided signed proof of delivery. Dispute rejected.', actorId: admin.id },
      ],
    },
    {
      transaction: allTransactions[3][0],
      userId: createdCustomers[3].id,
      reason: DisputeReason.UNAUTHORISED,
      description: 'I have never shopped at this merchant. This transaction is fraudulent.',
      status: DisputeStatus.UNDER_REVIEW,
      events: [
        { fromStatus: DisputeStatus.PENDING, toStatus: DisputeStatus.UNDER_REVIEW, note: 'Flagged as potential fraud. Escalated to the fraud investigation team.', actorId: admin.id },
      ],
    },
    {
      transaction: allTransactions[4][0],
      userId: createdCustomers[4].id,
      reason: DisputeReason.DUPLICATE,
      description: 'I was charged twice for the same transaction within minutes.',
      status: DisputeStatus.PENDING,
      events: [],
    },
    {
      transaction: allTransactions[5][0],
      userId: createdCustomers[5].id,
      reason: DisputeReason.INCORRECT_AMOUNT,
      description: 'The amount deducted does not match what was agreed at point of sale.',
      status: DisputeStatus.RESOLVED,
      events: [
        { fromStatus: DisputeStatus.PENDING, toStatus: DisputeStatus.UNDER_REVIEW, note: 'Requested transaction records from the merchant.', actorId: admin.id },
        { fromStatus: DisputeStatus.UNDER_REVIEW, toStatus: DisputeStatus.RESOLVED, note: 'Merchant confirmed billing error. Full refund issued.', actorId: admin.id },
      ],
    },
  ];

  for (const d of disputeSeeds) {
    const dispute = await prisma.dispute.create({
      data: {
        transactionId: d.transaction.id,
        userId: d.userId,
        reason: d.reason,
        description: d.description,
        status: d.status,
      },
    });
    for (const event of d.events) {
      await prisma.disputeEvent.create({
        data: {
          disputeId: dispute.id,
          fromStatus: event.fromStatus,
          toStatus: event.toStatus,
          note: event.note,
          actorId: event.actorId,
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
