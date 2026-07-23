/**
 * Seed script for the Support Ticket Management System.
 *
 * Idempotent: users are upserted by their unique email, and tickets/comments are
 * only created if the ticket table is empty, so re-running does not duplicate data.
 *
 * Run with: `npm run seed` (uses tsx).
 */
import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // --- Seeded users (no user-management UI in Core) ---
  const usersData = [
    { name: 'Alice Admin', email: 'alice@example.com', role: 'ADMIN' },
    { name: 'Bob Agent', email: 'bob@example.com', role: 'AGENT' },
    { name: 'Carol Agent', email: 'carol@example.com', role: 'AGENT' },
    { name: 'Dave Requester', email: 'dave@example.com', role: 'USER' },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, role: u.role },
        create: u,
      }),
    ),
  );

  const [alice, bob, carol, dave] = users;
  console.log(`Seeded ${users.length} users.`);

  // --- Sample tickets + comments (only if none exist) ---
  const existingTickets = await prisma.ticket.count();
  if (existingTickets > 0) {
    console.log(`Tickets already present (${existingTickets}); skipping ticket seed.`);
    return;
  }

  const login = await prisma.ticket.create({
    data: {
      title: 'Cannot log in to dashboard',
      description: 'User receives a 500 error when submitting the login form.',
      priority: Priority.HIGH,
      status: Status.OPEN,
      createdById: dave.id,
      assignedToId: bob.id,
      comments: {
        create: [
          { message: 'Reproduced on staging. Investigating.', createdById: bob.id },
        ],
      },
    },
  });

  const perf = await prisma.ticket.create({
    data: {
      title: 'Reports page is slow',
      description: 'The monthly reports page takes over 30 seconds to load.',
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      createdById: dave.id,
      assignedToId: carol.id,
      comments: {
        create: [
          { message: 'Added a missing index; measuring improvement.', createdById: carol.id },
        ],
      },
    },
  });

  const typo = await prisma.ticket.create({
    data: {
      title: 'Typo on landing page',
      description: 'The word "recieve" should be "receive" in the hero section.',
      priority: Priority.LOW,
      status: Status.RESOLVED,
      createdById: alice.id,
      assignedToId: bob.id,
    },
  });

  console.log(`Seeded tickets: ${[login.id, perf.id, typo.id].length}.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
