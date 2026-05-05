import { api } from './client';
import type { Room } from '../types';

export const roomsApi = {
  async listForApartment(apartmentId: number) {
    const res = await api.get<Room[]>('/rooms', { params: { apartmentId } });
    return res.data;
  },
  async get(id: number) {
    const res = await api.get<Room>(`/rooms/${id}`);
    return res.data;
  },
};
