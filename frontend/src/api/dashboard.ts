import { api } from './client';
import type { DashboardData } from '../types';

export const dashboardApi = {
  async getForApartment(apartmentId: number) {
    const res = await api.get<DashboardData>(`/dashboard/apartments/${apartmentId}`);
    return res.data;
  },
  async getLive(apartmentId: number) {
    const res = await api.get<{ totalWatts: number; activeCount: number }>(
      `/dashboard/apartments/${apartmentId}/live`,
    );
    return res.data;
  },
};
