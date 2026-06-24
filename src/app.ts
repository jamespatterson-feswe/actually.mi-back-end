import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/** imported routes */
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/** Authentication flows | register */
app.use('/auth', authRoutes);

/** Health check for testing purposes */
app.get('/health', (req, res) => {
  res.json({ status: 200, statusDesc: 'Server is healthy and running correctly.' });
});

export default app;
