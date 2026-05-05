import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { roomService } from '../services/roomService';

export const roomCreateSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  apartmentId: z.number().int().positive(),
});

export const roomUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
});

export const roomController = {
  async listForApartment(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.query.apartmentId);
      res.json(await roomService.listForApartment(apartmentId, req.user!.userId));
    } catch (e) {
      next(e);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await roomService.getById(Number(req.params.id), req.user!.userId));
    } catch (e) {
      next(e);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await roomService.create(req.body));
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await roomService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await roomService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
