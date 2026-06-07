import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { scheduleService } from '../services/scheduleService';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const timeRegex = /^\d{2}:\d{2}$/;

export const createScheduleSchema = z.object({
  deviceId: z.number().int().positive(),
  startTime: z.string().regex(timeRegex, 'startTime must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'endTime must be HH:MM'),
  days: z.array(z.enum(DAYS)).min(1),
});

export const updateScheduleSchema = z.object({
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  days: z.array(z.enum(DAYS)).min(1).optional(),
  active: z.boolean().optional(),
});

export const scheduleController = {
  async listForDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = Number(req.params.deviceId);
      const data = await scheduleService.listForDevice(deviceId, req.user!.userId);
      res.json(data);
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createScheduleSchema.parse(req.body);
      const data = await scheduleService.create(body, req.user!.userId);
      res.status(201).json(data);
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const body = updateScheduleSchema.parse(req.body);
      const data = await scheduleService.update(id, body, req.user!.userId);
      res.json(data);
    } catch (e) { next(e); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await scheduleService.remove(id, req.user!.userId);
      res.status(204).send();
    } catch (e) { next(e); }
  },
};
