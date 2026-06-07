import { prisma } from '../db/prisma';
import { User } from '@prisma/client';

export const userRepository = {
  findById: (id: number): Promise<User | null> =>
    prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),

  findAll: () =>
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),

  create: (data: { email: string; passwordHash: string; name: string; role?: string }) =>
    prisma.user.create({ data }),

  update: (id: number, data: Partial<{ name: string; email: string; passwordHash: string; role: string; hasConnected: boolean }>) =>
    prisma.user.update({ where: { id }, data }),

  delete: (id: number) =>
    prisma.user.delete({ where: { id } }),

  markConnected: (id: number) =>
    prisma.user.update({ where: { id }, data: { hasConnected: true } }),
};
