import { buildingRepository } from '../repositories/buildingRepository';
import { energyDataRepository } from '../repositories/energyDataRepository';
import { NotFoundError } from '../utils/errors';
import { prisma } from '../db/prisma';

export const buildingService = {
  list: () => buildingRepository.findAll(),

  async getById(id: number) {
    const b = await buildingRepository.findById(id);
    if (!b) throw new NotFoundError('Building');
    return b;
  },

  create: (data: { name: string; location: string }) => buildingRepository.create(data),

  update: (id: number, data: { name?: string; location?: string }) =>
    buildingRepository.update(id, data),

  remove: (id: number) => buildingRepository.remove(id),

  async getOverview(id: number) {
    const building = await buildingRepository.findById(id);
    if (!building) throw new NotFoundError('Building');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);

    const regularApts = building.apartments.filter((a) => !a.isShared);
    const sharedApts = building.apartments.filter((a) => a.isShared);

    const [apartments, devices] = await Promise.all([
      Promise.all(
        regularApts.map(async (apt) => {
          const [todayKwh, monthKwh] = await Promise.all([
            energyDataRepository.sumByApartmentInRange(apt.id, startOfDay, now),
            energyDataRepository.sumByApartmentInRange(apt.id, startOfMonth, now),
          ]);
          return { ...apt, todayKwh: Number(todayKwh.toFixed(3)), monthKwh: Number(monthKwh.toFixed(3)) };
        }),
      ),
      prisma.device.findMany({
        where: { room: { apartment: { buildingId: id } } },
        select: { type: true },
      }),
    ]);

    const sharedSpaces = sharedApts.map((apt) => ({
      id: apt.id,
      name: apt.number,
      rooms: apt.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        devices: room.devices.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          status: d.status,
          powerWatts: d.powerWatts,
        })),
      })),
    }));

    const totalTodayKwh = apartments.reduce((s, a) => s + a.todayKwh, 0);
    const totalMonthKwh = apartments.reduce((s, a) => s + a.monthKwh, 0);

    const typeCounts = new Map<string, number>();
    for (const d of devices) {
      typeCounts.set(d.type, (typeCounts.get(d.type) ?? 0) + 1);
    }
    const deviceDistribution = Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      building: { id: building.id, name: building.name, location: building.location },
      apartments,
      sharedSpaces,
      totalTodayKwh: Number(totalTodayKwh.toFixed(3)),
      totalMonthKwh: Number(totalMonthKwh.toFixed(3)),
      deviceDistribution,
    };
  },

  async toggleSharedDevice(buildingId: number, deviceId: number) {
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        room: { apartment: { buildingId, isShared: true } },
      },
    });
    if (!device) throw new NotFoundError('Shared device');
    return prisma.device.update({
      where: { id: deviceId },
      data: { status: !device.status },
    });
  },
};
