import { PATHS as paths } from './routes/auth/auth.constants';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/** Authentication flows: register, login, mi */
app.use(authRoutes);

/** Health check for testing purposes */
app.get('/health', (req, res) => {
  res.json({
    status: 200,
    statusDesc: 'Server is healthy and running correctly.',
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    statusDesc: 'Route was not found',
  });
});

export default app;
