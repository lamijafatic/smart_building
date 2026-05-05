import { prisma } from '../db/prisma';

export const deviceRepository = {
  findAllByApartment: (apartmentId: number) =>
    prisma.device.findMany({
      where: { room: { apartmentId } },
      include: { room: true },
      orderBy: { id: 'asc' },
    }),

  findById: (id: number) =>
    prisma.device.findUnique({
      where: { id },
      include: { room: { include: { apartment: true } } },
    }),

  findByRoom: (roomId: number) =>
    prisma.device.findMany({ where: { roomId }, orderBy: { id: 'asc' } }),

  create: (data: {
    name: string;
    type: string;
    powerWatts: number;
    roomId: number;
    status?: boolean;
  }) => prisma.device.create({ data }),

  update: (
    id: number,
    data: { name?: string; type?: string; status?: boolean; powerWatts?: number },
  ) => prisma.device.update({ where: { id }, data }),

  setStatus: (id: number, status: boolean) =>
    prisma.device.update({ where: { id }, data: { status } }),

  remove: (id: number) => prisma.device.delete({ where: { id } }),
};
