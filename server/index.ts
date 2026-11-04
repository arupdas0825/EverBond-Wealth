import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db';
import { initFirebaseAdmin } from './config/firebase';
import { initSocketServer } from './websocket/socketServer';
import partnerRoutes from './routes/partnerRoutes';
import userRoutes from './routes/userRoutes';
import { apiRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EverBond Wealth Partner System',
    mongodb: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/partner', partnerRoutes);
app.use('/api/user', userRoutes);

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error Handler]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.',
  });
});

const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Start server
async function startServer() {
  try {
    initFirebaseAdmin();

    server.listen(PORT, () => {
      console.log(`[EverBond Server] Running on http://localhost:${PORT}`);
      console.log(`[EverBond Server] Real-time WebSocket ready at ws://localhost:${PORT}`);
    });

    // Connect to MongoDB asynchronously; if initially unreachable, it retries in background
    connectDB().catch((err: any) => {
      console.warn('[EverBond Server] MongoDB initial connection attempt failed. Retrying in background...');
    });
  } catch (err: any) {
    console.error('[EverBond Server] Fatal startup error:', err.message);
    process.exit(1);
  }
}

// Handle test run flag (e.g. for build verification)
if (process.argv.includes('--test-run')) {
  initFirebaseAdmin();
  connectDB()
    .then(() => {
      console.log('[EverBond Server] Test run passed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[EverBond Server] Test run failed:', err);
      process.exit(1);
    });
} else {
  startServer();
}

export default app;
