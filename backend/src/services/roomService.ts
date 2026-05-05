import { roomRepository } from '../repositories/roomRepository';
import { apartmentRepository } from '../repositories/apartmentRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export const roomService = {
  async listForApartment(apartmentId: number, requestingUserId: number) {
    const apt = await apartmentRepository.findById(apartmentId);
    if (!apt) throw new NotFoundError('Apartment');
    if (apt.ownerId !== requestingUserId)
      throw new UnauthorizedError('You do not own this apartment');
    return roomRepository.findAllByApartment(apartmentId);
  },

  async getById(id: number, requestingUserId: number) {
    const room = await roomRepository.findById(id);
    if (!room) throw new NotFoundError('Room');
    if (room.apartment.ownerId !== requestingUserId)
      throw new UnauthorizedError('Not your room');
    return room;
  },

  create: (data: { name: string; type: string; apartmentId: number }) =>
    roomRepository.create(data),

  update: (id: number, data: { name?: string; type?: string }) =>
    roomRepository.update(id, data),

  remove: (id: number) => roomRepository.remove(id),
};
