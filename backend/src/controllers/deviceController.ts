import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { deviceService } from '../services/deviceService';
import { apartmentService } from '../services/apartmentService';

export const deviceCreateSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  powerWatts: z.number().nonnegative(),
  roomId: z.number().int().positive(),
  status: z.boolean().optional(),
});

export const deviceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  powerWatts: z.number().nonnegative().optional(),
  status: z.boolean().optional(),
});

export const deviceStatusSchema = z.object({
  status: z.boolean(),
});

export const deviceController = {
  async listForApartment(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.query.apartmentId);
      await apartmentService.getById(apartmentId, req.user!.userId);
      res.json(await deviceService.listForApartment(apartmentId, req.user!.userId));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await deviceService.getById(Number(req.params.id), req.user!.userId));
    } catch (e) {
      next(e);
    }
  },

  async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body as z.infer<typeof deviceStatusSchema>;
      const updated = await deviceService.setStatus(
        Number(req.params.id),
        status,
        req.user!.userId,
      );
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 7;
      res.json(await deviceService.getHistory(Number(req.params.id), req.user!.userId, days));
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await deviceService.create(req.body));
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await deviceService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await deviceService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
