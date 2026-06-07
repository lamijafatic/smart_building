import { api } from './client';

// ─── Admin entity interfaces ──────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  hasConnected: boolean;
  createdAt: string;
}

export interface AdminBuilding {
  id: number;
  name: string;
  location: string;
  apartments: AdminApartment[];
}

export interface AdminApartment {
  id: number;
  number: string;
  area: number;
  buildingId: number;
  ownerId: number | null;
  isShared: boolean;
  building?: { id: number; name: string; location: string };
  owner?: { id: number; name: string; email: string };
  rooms?: AdminRoom[];
}

export interface AdminRoom {
  id: number;
  name: string;
  type: string;
  apartmentId: number;
  apartment?: {
    id: number;
    number: string;
    building?: { id: number; name: string };
  };
  devices?: AdminDevice[];
}

export interface AdminDevice {
  id: number;
  name: string;
  type: string;
  powerWatts: number;
  status: boolean;
  roomId: number;
  room?: {
    id: number;
    name: string;
    apartment?: {
      id: number;
      number: string;
      building?: { id: number; name: string };
    };
  };
}

// ─── Create / Update payloads ─────────────────────────────────────────────────

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  role?: string;
  password?: string;
}

export interface CreateBuildingPayload {
  name: string;
  location: string;
}

export interface UpdateBuildingPayload {
  name?: string;
  location?: string;
}

export interface CreateApartmentPayload {
  number: string;
  area: number;
  buildingId: number;
  ownerId?: number | null;
  isShared?: boolean;
}

export interface UpdateApartmentPayload {
  number?: string;
  area?: number;
  buildingId?: number;
  ownerId?: number | null;
}

export interface CreateRoomPayload {
  name: string;
  type: string;
  apartmentId: number;
}

export interface UpdateRoomPayload {
  name?: string;
  type?: string;
  apartmentId?: number;
}

export interface CreateDevicePayload {
  name: string;
  type: string;
  powerWatts: number;
  roomId: number;
}

export interface UpdateDevicePayload {
  name?: string;
  type?: string;
  powerWatts?: number;
  roomId?: number;
  status?: boolean;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const adminApi = {
  // Users
  users: {
    async list(): Promise<AdminUser[]> {
      const res = await api.get<AdminUser[]>('/admin/users');
      return res.data;
    },
    async create(payload: CreateUserPayload): Promise<AdminUser> {
      const res = await api.post<AdminUser>('/admin/users', payload);
      return res.data;
    },
    async update(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
      const res = await api.patch<AdminUser>(`/admin/users/${id}`, payload);
      return res.data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/admin/users/${id}`);
    },
  },

  // Buildings
  buildings: {
    async list(): Promise<AdminBuilding[]> {
      const res = await api.get<AdminBuilding[]>('/admin/buildings');
      return res.data;
    },
    async create(payload: CreateBuildingPayload): Promise<AdminBuilding> {
      const res = await api.post<AdminBuilding>('/admin/buildings', payload);
      return res.data;
    },
    async update(id: number, payload: UpdateBuildingPayload): Promise<AdminBuilding> {
      const res = await api.patch<AdminBuilding>(`/admin/buildings/${id}`, payload);
      return res.data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/admin/buildings/${id}`);
    },
  },

  // Apartments
  apartments: {
    async list(): Promise<AdminApartment[]> {
      const res = await api.get<AdminApartment[]>('/admin/apartments');
      return res.data;
    },
    async create(payload: CreateApartmentPayload): Promise<AdminApartment> {
      const res = await api.post<AdminApartment>('/admin/apartments', payload);
      return res.data;
    },
    async update(id: number, payload: UpdateApartmentPayload): Promise<AdminApartment> {
      const res = await api.patch<AdminApartment>(`/admin/apartments/${id}`, payload);
      return res.data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/admin/apartments/${id}`);
    },
  },

  // Rooms
  rooms: {
    async list(): Promise<AdminRoom[]> {
      const res = await api.get<AdminRoom[]>('/admin/rooms');
      return res.data;
    },
    async create(payload: CreateRoomPayload): Promise<AdminRoom> {
      const res = await api.post<AdminRoom>('/admin/rooms', payload);
      return res.data;
    },
    async update(id: number, payload: UpdateRoomPayload): Promise<AdminRoom> {
      const res = await api.patch<AdminRoom>(`/admin/rooms/${id}`, payload);
      return res.data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/admin/rooms/${id}`);
    },
  },

  // Devices
  devices: {
    async list(): Promise<AdminDevice[]> {
      const res = await api.get<AdminDevice[]>('/admin/devices');
      return res.data;
    },
    async create(payload: CreateDevicePayload): Promise<AdminDevice> {
      const res = await api.post<AdminDevice>('/admin/devices', payload);
      return res.data;
    },
    async update(id: number, payload: UpdateDevicePayload): Promise<AdminDevice> {
      const res = await api.patch<AdminDevice>(`/admin/devices/${id}`, payload);
      return res.data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/admin/devices/${id}`);
    },
  },
};
