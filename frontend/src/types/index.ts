export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Apartment {
  id: number;
  number: string;
  area: number;
  buildingId: number;
  ownerId: number;
  building?: Building;
}

export interface Building {
  id: number;
  name: string;
  location: string;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  apartmentId: number;
  devices?: Device[];
}

export interface Device {
  id: number;
  name: string;
  type: string;
  status: boolean;
  powerWatts: number;
  roomId: number;
  room?: Room;
}

export interface EnergyDataPoint {
  id: number;
  deviceId: number;
  timestamp: string;
  valueKwh: number;
}

export interface DashboardData {
  apartment: { id: number; number: string; area: number };
  totals: { day: number; week: number; month: number };
  rooms: {
    id: number;
    name: string;
    type: string;
    weekKwh: number;
    devices: {
      id: number;
      name: string;
      type: string;
      status: boolean;
      powerWatts: number;
      weekKwh: number;
    }[];
  }[];
  dailyChart: { date: string; kwh: number }[];
}
