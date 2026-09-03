import express, { Request, Response } from 'express';
import { aiRouter } from '../src/server/aiRouter';

const app = express();

app.use(express.json({ limit: '500kb' }));

// Cleanly mount API routes under /api
app.use('/api', aiRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}

export { app };
