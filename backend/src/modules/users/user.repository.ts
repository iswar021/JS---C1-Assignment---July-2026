import { prisma } from '../../lib/prisma';

/**
 * Data access for users. Users are seeded; this repository is used for
 * referential validation (e.g. ensuring createdBy/assignedTo exist).
 */
export const userRepository = {
  async existsById(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    return user !== null;
  },
};
