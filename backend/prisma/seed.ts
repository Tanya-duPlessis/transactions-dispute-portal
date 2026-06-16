import { PrismaClient, Role, Category, DisputeReason, DisputeStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const merchants = [
  { name: 'Checkers', category: Category.FOOD },
  { name: 'Pick n Pay', category: Category.FOOD },
  { name: 'Woolworths Food', category: Category.FOOD },
  { name: 'Uber Eats', category: Category.FOOD },
  { name: 'KFC', category: Category.FOOD },
  { name: 'McDonald\'s', category: Category.FOOD },
  { name: 'Uber', category: Category.TRANSPORT },
  { name: 'Bolt', category: Category.TRANSPORT },
  { name: 'Gautrain', category: Category.TRANSPORT },
  { name: 'ParkPlane', category: Category.TRANSPORT },
  { name: 'Shell Garage', category: Category.TRANSPORT },
  { name: 'Takealot', category: Category.SHOPPING },
  { name: 'Zara', category: Category.SHOPPING },
  { name: 'H&M', category: Category.SHOPPING },
  { name: 'Sportscene', category: Category.SHOPPING },
  { name: 'Clicks', category: Category.SHOPPING },
  { name: 'Netflix', category: Category.ENTERTAINMENT },
  { name: 'Spotify', category: Category.ENTERTAINMENT },
  { name: 'Steam', category: Category.ENTERTAINMENT },
  { name: 'Ster-Kinekor', category: Category.ENTERTAINMENT },
  { name: 'Eskom', category: Category.UTILITIES },
  { name: 'Telkom', category: Category.UTILITIES },
  { name: 'Vodacom', category: Category.UTILITIES },
  { name: 'City of Johannesburg', category: Category.UTILITIES },
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
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@demo.com',
      name: 'Sarah Johnson',
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@demo.com',
      name: 'James Mokoena',
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  console.log('Created users');

  const createTransactions = async (userId: string, count: number) => {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      const merchant = randomMerchant();
      transactions.push(
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
    return transactions;
  };

  const c1Transactions = await createTransactions(customer1.id, 55);
  const c2Transactions = await createTransactions(customer2.id, 50);

  console.log('Created transactions');

  // Pre-seed disputes in various states so reviewers see the full flow on first login
  const seedDisputes = [
    {
      transaction: c1Transactions[0],
      userId: customer1.id,
      reason: DisputeReason.UNAUTHORISED,
      description: 'I did not make this transaction. My card may have been compromised.',
      status: DisputeStatus.PENDING,
      events: [],
    },
    {
      transaction: c1Transactions[1],
      userId: customer1.id,
      reason: DisputeReason.DUPLICATE,
      description: 'This transaction appears twice on my statement for the same purchase.',
      status: DisputeStatus.UNDER_REVIEW,
      events: [
        {
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.UNDER_REVIEW,
          note: 'Dispute received and assigned to review team.',
          actorId: admin.id,
        },
      ],
    },
    {
      transaction: c1Transactions[2],
      userId: customer1.id,
      reason: DisputeReason.INCORRECT_AMOUNT,
      description: 'I was charged R850 but the receipt shows R350.',
      status: DisputeStatus.RESOLVED,
      events: [
        {
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.UNDER_REVIEW,
          note: 'Reviewing transaction records with the merchant.',
          actorId: admin.id,
        },
        {
          fromStatus: DisputeStatus.UNDER_REVIEW,
          toStatus: DisputeStatus.RESOLVED,
          note: 'Confirmed incorrect charge. Refund of R500 processed.',
          actorId: admin.id,
        },
      ],
    },
    {
      transaction: c2Transactions[0],
      userId: customer2.id,
      reason: DisputeReason.SERVICE_NOT_RECEIVED,
      description: 'Order was never delivered but I was charged.',
      status: DisputeStatus.REJECTED,
      events: [
        {
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.UNDER_REVIEW,
          note: 'Contacted merchant for delivery confirmation.',
          actorId: admin.id,
        },
        {
          fromStatus: DisputeStatus.UNDER_REVIEW,
          toStatus: DisputeStatus.REJECTED,
          note: 'Merchant provided delivery proof signed by customer. Dispute rejected.',
          actorId: admin.id,
        },
      ],
    },
    {
      transaction: c2Transactions[1],
      userId: customer2.id,
      reason: DisputeReason.UNAUTHORISED,
      description: 'I have never shopped at this store. This is fraudulent.',
      status: DisputeStatus.UNDER_REVIEW,
      events: [
        {
          fromStatus: DisputeStatus.PENDING,
          toStatus: DisputeStatus.UNDER_REVIEW,
          note: 'Flagged as potential fraud. Escalated to fraud team.',
          actorId: admin.id,
        },
      ],
    },
  ];

  for (const d of seedDisputes) {
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
  console.log('  Customer 1: customer1@demo.com / password123');
  console.log('  Customer 2: customer2@demo.com / password123');
  console.log('  Admin:      admin@demo.com     / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
