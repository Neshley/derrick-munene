import express, { Request, Response } from 'express';
import { aiRouter } from '../src/server/aiRouter';

const app = express();

app.set('trust proxy', 1);
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self), midi=(self)');
  next();
});

app.use(express.json({ limit: '500kb' }));

// Cleanly mount API routes under /api
app.use('/api', aiRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}

export { app };
