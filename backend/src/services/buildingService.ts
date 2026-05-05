import { buildingRepository } from '../repositories/buildingRepository';
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
};
