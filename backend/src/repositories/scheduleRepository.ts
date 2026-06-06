import { prisma } from '../db/prisma';

export const scheduleRepository = {
  findAllByDevice: (deviceId: number) =>
    prisma.schedule.findMany({ where: { deviceId }, orderBy: { createdAt: 'asc' } }),

  findById: (id: number) => prisma.schedule.findUnique({ where: { id }, include: { device: true } }),

  create: (data: { deviceId: number; startTime: string; endTime: string; days: string; active?: boolean }) =>
    prisma.schedule.create({ data }),

  update: (id: number, data: { startTime?: string; endTime?: string; days?: string; active?: boolean }) =>
    prisma.schedule.update({ where: { id }, data }),

  remove: (id: number) => prisma.schedule.delete({ where: { id } }),
};
