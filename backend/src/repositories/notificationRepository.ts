import { prisma } from '../db/prisma';

export const notificationRepository = {
  findAllByApartment: (apartmentId: number) =>
    prisma.notification.findMany({
      where: { apartmentId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),

  countUnread: (apartmentId: number) =>
    prisma.notification.count({ where: { apartmentId, read: false } }),

  create: (data: { apartmentId: number; message: string; type?: string }) =>
    prisma.notification.create({ data }),

  markRead: (id: number) => prisma.notification.update({ where: { id }, data: { read: true } }),

  markAllRead: (apartmentId: number) =>
    prisma.notification.updateMany({ where: { apartmentId }, data: { read: true } }),

  deleteOld: (apartmentId: number) =>
    prisma.notification.deleteMany({
      where: {
        apartmentId,
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
};
