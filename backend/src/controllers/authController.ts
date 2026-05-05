import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body as z.infer<typeof registerSchema>;
      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      res.json(user);
    } catch (e) {
      next(e);
    }
  },

  async logout(_req: Request, res: Response) {
    res.json({ message: 'Logged out' });
  },
};
