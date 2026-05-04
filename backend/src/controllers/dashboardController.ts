import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.params.apartmentId);
      res.json(await dashboardService.getDashboard(apartmentId, req.user!.userId));
    } catch (e) {
      next(e);
    }
  },

  async getLive(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.params.apartmentId);
      res.json(await dashboardService.getLivePower(apartmentId, req.user!.userId));
    } catch (e) {
      next(e);
    }
  },
};
