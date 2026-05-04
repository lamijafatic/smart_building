import { prisma } from '../db/prisma';

export const roomRepository = {
  findAllByApartment: (apartmentId: number) =>
    prisma.room.findMany({
      where: { apartmentId },
      include: { devices: true },
      orderBy: { id: 'asc' },
    }),

  findById: (id: number) =>
    prisma.room.findUnique({
      where: { id },
      include: { devices: true, apartment: true },
    }),

  create: (data: { name: string; type: string; apartmentId: number }) =>
    prisma.room.create({ data }),

  update: (id: number, data: { name?: string; type?: string }) =>
    prisma.room.update({ where: { id }, data }),

  remove: (id: number) => prisma.room.delete({ where: { id } }),
};
