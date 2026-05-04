import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import buildingRoutes from './routes/buildingRoutes';
import apartmentRoutes from './routes/apartmentRoutes';
import roomRoutes from './routes/roomRoutes';
import deviceRoutes from './routes/deviceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/buildings', buildingRoutes);
  app.use('/api/apartments', apartmentRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/devices', deviceRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(errorHandler);

  return app;
}
