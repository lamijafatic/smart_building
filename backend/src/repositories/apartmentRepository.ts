import { prisma } from '../db/prisma';

export const apartmentRepository = {
  findAllByOwner: (ownerId: number) =>
    prisma.apartment.findMany({
      where: { ownerId },
      include: { building: true },
      orderBy: { id: 'asc' },
    }),

  findById: (id: number) =>
    prisma.apartment.findUnique({
      where: { id },
      include: { building: true, rooms: { include: { devices: true } } },
    }),

  create: (data: { number: string; area: number; buildingId: number; ownerId: number }) =>
    prisma.apartment.create({ data }),

  update: (id: number, data: { number?: string; area?: number }) =>
    prisma.apartment.update({ where: { id }, data }),

  remove: (id: number) => prisma.apartment.delete({ where: { id } }),
};
