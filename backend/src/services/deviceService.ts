import { deviceRepository } from '../repositories/deviceRepository';
import { energyDataRepository } from '../repositories/energyDataRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export const deviceService = {
  async listForApartment(apartmentId: number, requestingUserId: number) {
    const devices = await deviceRepository.findAllByApartment(apartmentId);
    if (devices[0] && devices[0].room.apartmentId !== apartmentId) {
      throw new UnauthorizedError();
    }
    return devices;
  },

  async getById(id: number, requestingUserId: number) {
    const d = await deviceRepository.findById(id);
    if (!d) throw new NotFoundError('Device');
    if (d.room.apartment.ownerId !== requestingUserId) {
      throw new UnauthorizedError('Not your device');
    }
    return d;
  },

  async setStatus(id: number, status: boolean, requestingUserId: number) {
    const d = await deviceRepository.findById(id);
    if (!d) throw new NotFoundError('Device');
    if (d.room.apartment.ownerId !== requestingUserId) {
      throw new UnauthorizedError('Not your device');
    }
    return deviceRepository.setStatus(id, status);
  },

  async getHistory(deviceId: number, requestingUserId: number, days = 7) {
    const d = await deviceRepository.findById(deviceId);
    if (!d) throw new NotFoundError('Device');
    if (d.room.apartment.ownerId !== requestingUserId) {
      throw new UnauthorizedError('Not your device');
    }
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    return energyDataRepository.timeSeriesByDevice(deviceId, from, to);
  },

  create: (data: {
    name: string;
    type: string;
    powerWatts: number;
    roomId: number;
    status?: boolean;
  }) => deviceRepository.create(data),

  update: (
    id: number,
    data: { name?: string; type?: string; status?: boolean; powerWatts?: number },
  ) => deviceRepository.update(id, data),

  remove: (id: number) => deviceRepository.remove(id),
};
