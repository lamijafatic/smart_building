import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db/prisma';
import { specFor } from '../utils/deviceFactory';

export const adminController = {
  // ── Users ──────────────────────────────────────────
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, hasConnected: true, createdAt: true },
      });
      res.json(users);
    } catch (e) { next(e); }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role = 'RESIDENT' } = req.body as {
        email: string; password: string; name: string; role?: string;
      };
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash, name, role },
        select: { id: true, email: true, name: true, role: true, hasConnected: true, createdAt: true },
      });
      res.status(201).json(user);
    } catch (e) { next(e); }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, email, role, password } = req.body as {
        name?: string; email?: string; role?: string; password?: string;
      };
      const data: Record<string, unknown> = {};
      if (name) data.name = name;
      if (email) data.email = email;
      if (role) data.role = role;
      if (password) data.passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, name: true, role: true, hasConnected: true, createdAt: true },
      });
      res.json(user);
    } catch (e) { next(e); }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.user.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (e) { next(e); }
  },

  // ── Buildings ──────────────────────────────────────
  async listBuildings(req: Request, res: Response, next: NextFunction) {
    try {
      const buildings = await prisma.building.findMany({
        include: { apartments: { include: { owner: { select: { id: true, name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(buildings);
    } catch (e) { next(e); }
  },

  async createBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, location } = req.body as { name: string; location: string };
      const building = await prisma.building.create({ data: { name, location } });
      res.status(201).json(building);
    } catch (e) { next(e); }
  },

  async updateBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, location } = req.body as { name?: string; location?: string };
      const building = await prisma.building.update({
        where: { id: Number(req.params.id) },
        data: { ...(name && { name }), ...(location && { location }) },
      });
      res.json(building);
    } catch (e) { next(e); }
  },

  async deleteBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.building.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (e) { next(e); }
  },

  // ── Apartments ─────────────────────────────────────
  async listApartments(req: Request, res: Response, next: NextFunction) {
    try {
      const apartments = await prisma.apartment.findMany({
        include: {
          building: true,
          owner: { select: { id: true, name: true, email: true } },
          rooms: { include: { devices: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(apartments);
    } catch (e) { next(e); }
  },

  async createApartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { number, area, buildingId, ownerId, isShared } = req.body as {
        number: string; area: number; buildingId: number; ownerId?: number | null; isShared?: boolean;
      };
      const apartment = await prisma.apartment.create({
        data: { number, area, buildingId, ownerId: ownerId || null, isShared: isShared ?? false },
        include: { building: true, owner: { select: { id: true, name: true, email: true } } },
      });
      res.status(201).json(apartment);
    } catch (e) { next(e); }
  },

  async updateApartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { number, area, buildingId, ownerId, isShared } = req.body as {
        number?: string; area?: number; buildingId?: number; ownerId?: number | null; isShared?: boolean;
      };
      const apartment = await prisma.apartment.update({
        where: { id: Number(req.params.id) },
        data: {
          ...(number && { number }),
          ...(area !== undefined && { area }),
          ...(buildingId && { buildingId }),
          ...(ownerId !== undefined && { ownerId: ownerId || null }),
          ...(isShared !== undefined && { isShared }),
        },
        include: { building: true, owner: { select: { id: true, name: true, email: true } } },
      });
      res.json(apartment);
    } catch (e) { next(e); }
  },

  async deleteApartment(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.apartment.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (e) { next(e); }
  },

  // ── Rooms ──────────────────────────────────────────
  async listRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await prisma.room.findMany({
        include: { apartment: { include: { building: true } }, devices: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json(rooms);
    } catch (e) { next(e); }
  },

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, apartmentId } = req.body as { name: string; type: string; apartmentId: number };
      const room = await prisma.room.create({
        data: { name, type, apartmentId },
        include: { apartment: true },
      });
      res.status(201).json(room);
    } catch (e) { next(e); }
  },

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type } = req.body as { name?: string; type?: string };
      const room = await prisma.room.update({
        where: { id: Number(req.params.id) },
        data: { ...(name && { name }), ...(type && { type }) },
      });
      res.json(room);
    } catch (e) { next(e); }
  },

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.room.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (e) { next(e); }
  },

  // ── Devices ────────────────────────────────────────
  async listDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await prisma.device.findMany({
        include: { room: { include: { apartment: { include: { building: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(devices);
    } catch (e) { next(e); }
  },

  async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, roomId, powerWatts } = req.body as {
        name: string; type: string; roomId: number; powerWatts?: number;
      };
      const spec = specFor(type);
      const device = await prisma.device.create({
        data: {
          name,
          type,
          roomId,
          powerWatts: powerWatts ?? spec.defaultPowerWatts,
        },
        include: { room: { include: { apartment: { include: { building: true } } } } },
      });
      res.status(201).json(device);
    } catch (e) { next(e); }
  },

  async updateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, powerWatts, roomId } = req.body as {
        name?: string; type?: string; powerWatts?: number; roomId?: number;
      };
      const device = await prisma.device.update({
        where: { id: Number(req.params.id) },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(powerWatts !== undefined && { powerWatts }),
          ...(roomId && { roomId }),
        },
      });
      res.json(device);
    } catch (e) { next(e); }
  },

  async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.device.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (e) { next(e); }
  },
};
