import { notificationRepository } from '../repositories/notificationRepository';
import { energyDataRepository } from '../repositories/energyDataRepository';
import { apartmentRepository } from '../repositories/apartmentRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

const HIGH_ENERGY_THRESHOLD_KWH = 5; // alert if today's total > 5 kWh

async function assertApartmentOwner(apartmentId: number, userId: number) {
  const apt = await apartmentRepository.findById(apartmentId);
  if (!apt) throw new NotFoundError('Apartment');
  if (apt.ownerId !== userId) throw new UnauthorizedError('Access denied');
  return apt;
}

export const notificationService = {
  async list(apartmentId: number, userId: number) {
    await assertApartmentOwner(apartmentId, userId);
    await notificationService.generateEnergyAlerts(apartmentId);
    const notifications = await notificationRepository.findAllByApartment(apartmentId);
    const unreadCount = await notificationRepository.countUnread(apartmentId);
    return { notifications, unreadCount };
  },

  async generateEnergyAlerts(apartmentId: number) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const todayKwh = await energyDataRepository.sumByApartmentInRange(apartmentId, startOfDay, now);

    if (todayKwh > HIGH_ENERGY_THRESHOLD_KWH) {
      const existing = await notificationRepository.findAllByApartment(apartmentId);
      const todayStr = startOfDay.toISOString().slice(0, 10);
      const alreadyNotified = existing.some(
        (n) => n.type === 'HIGH_ENERGY' && n.createdAt >= startOfDay,
      );
      if (!alreadyNotified) {
        await notificationRepository.create({
          apartmentId,
          message: `High energy alert: ${todayKwh.toFixed(2)} kWh consumed today (threshold: ${HIGH_ENERGY_THRESHOLD_KWH} kWh). Consider turning off unused devices.`,
          type: 'HIGH_ENERGY',
        });
      }
      void todayStr;
    }
  },

  async markRead(id: number, userId: number) {
    const notifications = await notificationRepository.findAllByApartment(0);
    void notifications;
    await notificationRepository.markRead(id);
  },

  async markAllRead(apartmentId: number, userId: number) {
    await assertApartmentOwner(apartmentId, userId);
    await notificationRepository.markAllRead(apartmentId);
  },
};
