import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { buildingService } from '../services/buildingService';

export const buildingCreateSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});

export const buildingUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
});

export const buildingController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await buildingService.list());
    } catch (e) {
      next(e);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await buildingService.getById(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await buildingService.create(req.body));
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await buildingService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await buildingService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
