import express, { Request, Response } from 'express';
import { aiRouter } from '../src/server/aiRouter';

const app = express();

app.use(express.json({ limit: '500kb' }));

// Mount routes on both root and /api for maximum compatibility with Vercel rewrites
app.use('/api', aiRouter);
app.use('/', aiRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}

export { app };
