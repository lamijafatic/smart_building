import { api } from './client';

export interface SharedDevice {
  id: number;
  name: string;
  type: string;
  status: boolean;
  powerWatts: number;
}

export interface SharedSpace {
  id: number;
  name: string;
  rooms: { id: number; name: string; devices: SharedDevice[] }[];
}

export interface BuildingOverview {
  building: { id: number; name: string; location: string };
  apartments: {
    id: number; number: string; area: number; activeMode: string;
    todayKwh: number; monthKwh: number;
  }[];
  sharedSpaces?: SharedSpace[];
  totalTodayKwh: number;
  totalMonthKwh: number;
  deviceDistribution?: { type: string; count: number }[];
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
  async toggleSharedDevice(buildingId: number, deviceId: number): Promise<SharedDevice> {
    const res = await api.patch<SharedDevice>(`/buildings/${buildingId}/shared-devices/${deviceId}/toggle`);
    return res.data;
  },
};
