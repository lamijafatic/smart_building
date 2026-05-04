import { prisma } from '../db/prisma';

export const energyDataRepository = {
  recordReading: (data: { deviceId: number; valueKwh: number; timestamp?: Date }) =>
    prisma.energyData.create({ data }),

  recordReadingsBulk: (
    readings: { deviceId: number; valueKwh: number; timestamp: Date }[],
  ) => prisma.energyData.createMany({ data: readings }),

  findByDeviceInRange: (deviceId: number, from: Date, to: Date) =>
    prisma.energyData.findMany({
      where: { deviceId, timestamp: { gte: from, lte: to } },
      orderBy: { timestamp: 'asc' },
    }),

  sumByApartmentInRange: async (apartmentId: number, from: Date, to: Date): Promise<number> => {
    const result = await prisma.energyData.aggregate({
      _sum: { valueKwh: true },
      where: {
        timestamp: { gte: from, lte: to },
        device: { room: { apartmentId } },
      },
    });
    return result._sum.valueKwh ?? 0;
  },

  sumPerDeviceInApartment: async (apartmentId: number, from: Date, to: Date) => {
    return prisma.energyData.groupBy({
      by: ['deviceId'],
      where: {
        timestamp: { gte: from, lte: to },
        device: { room: { apartmentId } },
      },
      _sum: { valueKwh: true },
    });
  },

  timeSeriesByDevice: (deviceId: number, from: Date, to: Date) =>
    prisma.energyData.findMany({
      where: { deviceId, timestamp: { gte: from, lte: to } },
      orderBy: { timestamp: 'asc' },
    }),

  readingsByApartmentInRange: (apartmentId: number, from: Date, to: Date) =>
    prisma.energyData.findMany({
      where: {
        timestamp: { gte: from, lte: to },
        device: { room: { apartmentId } },
      },
      include: { device: { include: { room: true } } },
      orderBy: { timestamp: 'asc' },
    }),
};
