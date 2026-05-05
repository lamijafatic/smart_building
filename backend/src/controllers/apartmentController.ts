import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { apartmentService } from '../services/apartmentService';

export const apartmentCreateSchema = z.object({
  number: z.string().min(1),
  area: z.number().positive(),
  buildingId: z.number().int().positive(),
});

export const apartmentUpdateSchema = z.object({
  number: z.string().min(1).optional(),
  area: z.number().positive().optional(),
});

export const apartmentController = {
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await apartmentService.listForUser(req.user!.userId));
    } catch (e) {
      next(e);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await apartmentService.getById(Number(req.params.id), req.user!.userId));
    } catch (e) {
      next(e);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await apartmentService.create({
        ...req.body,
        ownerId: req.user!.userId,
      });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await apartmentService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await apartmentService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
