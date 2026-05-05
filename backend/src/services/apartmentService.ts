import { apartmentRepository } from '../repositories/apartmentRepository';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

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
};
