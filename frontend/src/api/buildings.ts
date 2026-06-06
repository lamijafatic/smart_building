import { api } from './client';

export interface BuildingOverview {
  building: { id: number; name: string; location: string };
  apartments: {
    id: number; number: string; area: number; activeMode: string;
    todayKwh: number; monthKwh: number;
  }[];
  totalTodayKwh: number;
  totalMonthKwh: number;
}

export const buildingsApi = {
  async getOverview(buildingId: number): Promise<BuildingOverview> {
    const res = await api.get<BuildingOverview>(`/buildings/${buildingId}/overview`);
    return res.data;
  },
  async list() {
    const res = await api.get<{ id: number; name: string; location: string }[]>('/buildings');
    return res.data;
  },
};
