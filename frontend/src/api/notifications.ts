import { api } from './client';

export interface Notification {
  id: number;
  apartmentId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  async list(apartmentId: number): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await api.get(`/notifications/apartments/${apartmentId}`);
    return res.data;
  },
  async markRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
  async markAllRead(apartmentId: number): Promise<void> {
    await api.patch(`/notifications/apartments/${apartmentId}/read-all`);
  },
};
