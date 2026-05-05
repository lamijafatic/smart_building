import { api } from './client';
import type { Device, EnergyDataPoint } from '../types';

export const devicesApi = {
  async listForApartment(apartmentId: number) {
    const res = await api.get<Device[]>('/devices', { params: { apartmentId } });
    return res.data;
  },
  async get(id: number) {
    const res = await api.get<Device>(`/devices/${id}`);
    return res.data;
  },
  async setStatus(id: number, status: boolean) {
    const res = await api.patch<Device>(`/devices/${id}/status`, { status });
    return res.data;
  },
  async history(id: number, days = 7) {
    const res = await api.get<EnergyDataPoint[]>(`/devices/${id}/history`, {
      params: { days },
    });
    return res.data;
  },
};
