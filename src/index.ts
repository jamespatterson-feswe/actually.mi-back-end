import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 8080;

server.use(cors());
server.use(express());

server.get('/health', (req, res) => {
  res.json({ status: 200, statusDesc: 'Server is healthy and running correctly.' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
})
