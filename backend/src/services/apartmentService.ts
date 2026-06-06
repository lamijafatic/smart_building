import { apartmentRepository } from '../repositories/apartmentRepository';
import { deviceRepository } from '../repositories/deviceRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

const HOME_MODE_ON_TYPES = ['LIGHT', 'THERMOSTAT'];
const AWAY_MODE_OFF_ALL = true;

export const apartmentService = {
  listForUser: (ownerId: number) => apartmentRepository.findAllByOwner(ownerId),

  async getById(id: number, requestingUserId: number) {
    const apt = await apartmentRepository.findById(id);
    if (!apt) throw new NotFoundError('Apartment');
    if (apt.ownerId !== requestingUserId) {
      throw new UnauthorizedError('You do not own this apartment');
    }
    return apt;
  },

  create: (data: { number: string; area: number; buildingId: number; ownerId: number }) =>
    apartmentRepository.create(data),

  update: (id: number, data: { number?: string; area?: number }) =>
    apartmentRepository.update(id, data),

  remove: (id: number) => apartmentRepository.remove(id),

  async setMode(apartmentId: number, mode: 'HOME' | 'AWAY' | 'NONE', userId: number) {
    const apt = await apartmentRepository.findById(apartmentId);
    if (!apt) throw new NotFoundError('Apartment');
    if (apt.ownerId !== userId) throw new UnauthorizedError('Access denied');

    const devices = await deviceRepository.findAllByApartment(apartmentId);

    if (mode === 'HOME') {
      // Turn on lights and thermostat, turn off heavy appliances
      await Promise.all(
        devices.map((d) =>
          deviceRepository.setStatus(d.id, HOME_MODE_ON_TYPES.includes(d.type)),
        ),
      );
    } else if (mode === 'AWAY') {
      // Turn off all devices
      void AWAY_MODE_OFF_ALL;
      await Promise.all(devices.map((d) => deviceRepository.setStatus(d.id, false)));
    }
    // NONE: no device changes, just clear the mode label

    return apartmentRepository.update(apartmentId, { activeMode: mode } as { number?: string; area?: number; activeMode?: string });
  },
};
