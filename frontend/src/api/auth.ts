import { api } from './client';
import type { User } from '../types';

export const authApi = {
  async register(email: string, password: string, name: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name });
    return res.data;
  },
  async login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },
  async me() {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
};
