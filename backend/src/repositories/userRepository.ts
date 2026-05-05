import { prisma } from '../db/prisma';
import { User } from '@prisma/client';

export const userRepository = {
  findById: (id: number): Promise<User | null> =>
    prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { email: string; passwordHash: string; name: string; role?: string }) =>
    prisma.user.create({ data }),
};
