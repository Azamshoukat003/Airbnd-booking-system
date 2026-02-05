import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './config/logger';
import unitsRoutes from './routes/units.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';
import paymentRoutes from './routes/payment.routes';
import { startIcalCron } from './jobs/ical-cron';

// Extend Express Request type to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_DASHBOARD_URL],
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req: express.Request, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/units', unitsRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Unhandled error', { error: message });
    res.status(500).json({ error: 'Internal server error' });
  },
);

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
  startIcalCron();
});
