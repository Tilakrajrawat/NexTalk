import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { configureSocket } from './socket/socketHandler.js';

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('src/uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);
configureSocket(io);

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
