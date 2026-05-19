import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db';
import apiRoutes from './server/routes/api';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  // Database Connection
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('**************************************************');
    console.error('* WARNING: DATABASE NOT CONNECTED                *');
    console.error('* Some features will be disabled.                *');
    console.error('* check your MONGODB_URI environment variable.   *');
    console.error('**************************************************');
  }

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // For development and iframe compatibility
  }));
  app.use(cors());
  app.use(express.json());

  // Socket.io injection mapping
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected'));
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Namaste Mart Server running on http://localhost:${PORT}`);
  });
}

startServer();
