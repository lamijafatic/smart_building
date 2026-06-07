import { api } from './client';

export interface Schedule {
  id: number;
  deviceId: number;
  startTime: string;
  endTime: string;
  days: string[];
  active: boolean;
  createdAt: string;
}

export const schedulesApi = {
  async listForDevice(deviceId: number): Promise<Schedule[]> {
    const res = await api.get<Schedule[]>(`/schedules/device/${deviceId}`);
    return res.data;
  },
  async create(data: { deviceId: number; startTime: string; endTime: string; days: string[] }): Promise<Schedule> {
    const res = await api.post<Schedule>('/schedules', data);
    return res.data;
  },
  async update(id: number, data: { startTime?: string; endTime?: string; days?: string[]; active?: boolean }): Promise<Schedule> {
    const res = await api.patch<Schedule>(`/schedules/${id}`, data);
    return res.data;
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/schedules/${id}`);
  },
};
