import { buildingRepository } from '../repositories/buildingRepository';
import { energyDataRepository } from '../repositories/energyDataRepository';
import { NotFoundError } from '../utils/errors';

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

    const apartments = await Promise.all(
      building.apartments.map(async (apt) => {
        const [todayKwh, monthKwh] = await Promise.all([
          energyDataRepository.sumByApartmentInRange(apt.id, startOfDay, now),
          energyDataRepository.sumByApartmentInRange(apt.id, startOfMonth, now),
        ]);
        return { ...apt, todayKwh: Number(todayKwh.toFixed(3)), monthKwh: Number(monthKwh.toFixed(3)) };
      }),
    );

    const totalTodayKwh = apartments.reduce((s, a) => s + a.todayKwh, 0);
    const totalMonthKwh = apartments.reduce((s, a) => s + a.monthKwh, 0);

    return {
      building: { id: building.id, name: building.name, location: building.location },
      apartments,
      totalTodayKwh: Number(totalTodayKwh.toFixed(3)),
      totalMonthKwh: Number(totalMonthKwh.toFixed(3)),
    };
  },
};
