import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.params.apartmentId);
      const data = await notificationService.list(apartmentId, req.user!.userId);
      res.json(data);
    } catch (e) { next(e); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await notificationService.markRead(id, req.user!.userId);
      res.json({ ok: true });
    } catch (e) { next(e); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.params.apartmentId);
      await notificationService.markAllRead(apartmentId, req.user!.userId);
      res.json({ ok: true });
    } catch (e) { next(e); }
  },
};
