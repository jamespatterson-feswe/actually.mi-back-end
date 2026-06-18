import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/** imported routes */
import authRoutes from './routes/auth.routes';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 8080;

server.use(cors());
server.use(express.json());

server.use('/auth', authRoutes);

server.get('/health', (req, res) => {
  res.json({ status: 200, statusDesc: 'Server is healthy and running correctly.' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
})

