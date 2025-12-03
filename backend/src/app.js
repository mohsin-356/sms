import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { loadEnv } from './config/env.js';

loadEnv();

const app = express();

// CORS
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) =>
      cb(null, !origin || allowed.length === 0 || allowed.includes(origin)),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount API under /api to align with frontend VITE_API_URL default
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
