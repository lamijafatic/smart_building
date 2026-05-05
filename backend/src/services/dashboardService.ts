import { apartmentRepository } from '../repositories/apartmentRepository';
import { energyDataRepository } from '../repositories/energyDataRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d = new Date()): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d = new Date()): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export const dashboardService = {
  async getDashboard(apartmentId: number, requestingUserId: number) {
    const apt = await apartmentRepository.findById(apartmentId);
    if (!apt) throw new NotFoundError('Apartment');
    if (apt.ownerId !== requestingUserId) throw new UnauthorizedError();

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const chartStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    const [totalDay, totalWeek, totalMonth, perDeviceWeek, allDevicesChart] = await Promise.all([
      energyDataRepository.sumByApartmentInRange(apartmentId, todayStart, now),
      energyDataRepository.sumByApartmentInRange(apartmentId, weekStart, now),
      energyDataRepository.sumByApartmentInRange(apartmentId, monthStart, now),
      energyDataRepository.sumPerDeviceInApartment(apartmentId, weekStart, now),
      energyDataRepository.readingsByApartmentInRange(apartmentId, chartStart, now),
    ]);

    const deviceUsageMap = new Map<number, number>();
    perDeviceWeek.forEach((row) => {
      deviceUsageMap.set(row.deviceId, row._sum.valueKwh ?? 0);
    });

    const rooms = apt.rooms.map((room) => {
      const devices = room.devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        powerWatts: d.powerWatts,
        weekKwh: deviceUsageMap.get(d.id) ?? 0,
      }));
      const roomKwh = devices.reduce((s, d) => s + d.weekKwh, 0);
      return { id: room.id, name: room.name, type: room.type, weekKwh: roomKwh, devices };
    });

    const days: { date: string; kwh: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const total = allDevicesChart
        .filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd)
        .reduce((s, r) => s + r.valueKwh, 0);
      const y = dayStart.getFullYear();
      const mo = String(dayStart.getMonth() + 1).padStart(2, '0');
      const d = String(dayStart.getDate()).padStart(2, '0');
      days.push({ date: `${y}-${mo}-${d}`, kwh: Number(total.toFixed(3)) });
    }

    return {
      apartment: { id: apt.id, number: apt.number, area: apt.area },
      totals: {
        day: Number(totalDay.toFixed(3)),
        week: Number(totalWeek.toFixed(3)),
        month: Number(totalMonth.toFixed(3)),
      },
      rooms,
      dailyChart: days,
    };
  },

  async getLivePower(apartmentId: number, requestingUserId: number) {
    const apt = await apartmentRepository.findById(apartmentId);
    if (!apt) throw new NotFoundError('Apartment');
    if (apt.ownerId !== requestingUserId) throw new UnauthorizedError();

    const onDevices = apt.rooms.flatMap((r) => r.devices).filter((d) => d.status);
    const totalWatts = onDevices.reduce((s, d) => s + d.powerWatts, 0);
    const activeCount = onDevices.length;

    return { totalWatts, activeCount };
  },
};
