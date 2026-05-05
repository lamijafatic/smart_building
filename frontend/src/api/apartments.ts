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
};
