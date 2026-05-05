import { prisma } from '../db/prisma';

export const buildingRepository = {
  findAll: () => prisma.building.findMany({ orderBy: { id: 'asc' } }),

  findById: (id: number) =>
    prisma.building.findUnique({
      where: { id },
      include: { apartments: true },
    }),

  create: (data: { name: string; location: string }) => prisma.building.create({ data }),

  update: (id: number, data: { name?: string; location?: string }) =>
    prisma.building.update({ where: { id }, data }),

  remove: (id: number) => prisma.building.delete({ where: { id } }),
};
