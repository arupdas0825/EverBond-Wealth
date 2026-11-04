import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyFirebaseToken } from '../config/firebase';
import { User } from '../models/User';
import { Session } from '../models/Session';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Socket Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('AUTHENTICATION_REQUIRED'));
      }

      const verified = await verifyFirebaseToken(token);
      socket.data.user = verified;
      next();
    } catch (err: any) {
      console.warn('[WebSocket] Auth rejected for socket:', socket.id, err.message);
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    if (!user || !user.uid) {
      socket.disconnect(true);
      return;
    }

    const uid = user.uid;
    const userRoom = `user:${uid}`;
    socket.join(userRoom);

    console.log(`[WebSocket] Client connected: socket=${socket.id}, uid=${uid}`);

    // Join workspace room if user has an active partner workspace
    let activeWorkspaceId: string | null = null;
    try {
      const dbUser = await User.findOne({ firebaseUid: uid });
      if (dbUser && dbUser.workspaceId && dbUser.partnerStatus === 'connected') {
        activeWorkspaceId = dbUser.workspaceId;
        const workspaceRoom = `workspace:${activeWorkspaceId}`;
        socket.join(workspaceRoom);
        console.log(`[WebSocket] User ${uid} joined room ${workspaceRoom}`);

        // Notify partner that this user is online
        socket.to(workspaceRoom).emit('partner:online', {
          uid,
          timestamp: new Date().toISOString(),
        });
      }

      // Record active session
      await Session.findOneAndUpdate(
        { socketId: socket.id },
        {
          userUid: uid,
          workspaceId: activeWorkspaceId,
          socketId: socket.id,
          connectedAt: new Date(),
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.error('[WebSocket] Setup session error:', err.message);
    }

    // Join/leave workspace event from client
    socket.on('workspace:join', (workspaceId: string) => {
      if (workspaceId && activeWorkspaceId === workspaceId) {
        socket.join(`workspace:${workspaceId}`);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[WebSocket] Client disconnected: socket=${socket.id}, uid=${uid}`);
      try {
        await Session.deleteOne({ socketId: socket.id });

        if (activeWorkspaceId) {
          const workspaceRoom = `workspace:${activeWorkspaceId}`;
          socket.to(workspaceRoom).emit('partner:offline', {
            uid,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error('[WebSocket] Disconnect cleanup error:', err.message);
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO is not initialized yet.');
  }
  return io;
}

/**
 * Emit an event to a specific user's private room
 */
export function emitToUser(uid: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`user:${uid}`).emit(event, payload);
}

/**
 * Emit an event to all members of an active workspace
 */
export function emitToWorkspace(workspaceId: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
}

/**
 * Emit an event to a list of users
 */
export function emitToUsers(uids: string[], event: string, payload: any): void {
  if (!io) return;
  uids.forEach((uid) => {
    io!.to(`user:${uid}`).emit(event, payload);
  });
}
