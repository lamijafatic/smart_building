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

  async getChart(req: Request, res: Response, next: NextFunction) {
    try {
      const apartmentId = Number(req.params.apartmentId);
      const days = Math.min(90, Math.max(1, Number(req.query.days) || 7));
      res.json(await dashboardService.getEnergyChart(apartmentId, req.user!.userId, days));
    } catch (e) {
      next(e);
    }
  },
};
