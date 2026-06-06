import { api } from './client';
import type { Apartment } from '../types';

export const apartmentsApi = {
  async list() {
    const res = await api.get<Apartment[]>('/apartments');
    return res.data;
  },
  async get(id: number) {
    const res = await api.get<Apartment>(`/apartments/${id}`);
    return res.data;
  },
  async setMode(id: number, mode: 'HOME' | 'AWAY' | 'NONE') {
    const res = await api.patch<{ activeMode: string }>(`/apartments/${id}/mode`, { mode });
    return res.data;
  },
};
