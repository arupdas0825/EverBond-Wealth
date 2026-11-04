/**
 * socketService.js
 * Client-side Socket.IO real-time manager.
 * Authenticates with backend using Firebase ID Token.
 * Handles auto-reconnect and real-time event dispatching.
 */

import { io } from 'socket.io-client';
import { auth } from '../utils/firebase';

let socket = null;
const eventListeners = new Map(); // event -> Set<callback>

export async function connectSocket() {
  const currentUser = auth?.currentUser;
  if (!currentUser) return null;

  if (socket && socket.connected) {
    return socket;
  }

  try {
    const token = await currentUser.getIdToken(false);

    socket = io(window.location.origin, {
      path: '/socket.io',
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to real-time partner network:', socket.id);
      dispatch('socket:connected', { socketId: socket.id });
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected from partner network:', reason);
      dispatch('socket:disconnected', { reason });
    });

    socket.on('connect_error', async (err) => {
      console.warn('[Socket] Connection error:', err.message);
      // Refresh token on auth failure
      if (err.message.includes('UNAUTHORIZED') || err.message.includes('AUTHENTICATION_REQUIRED')) {
        try {
          const freshToken = await currentUser.getIdToken(true);
          if (socket) {
            socket.auth = { token: freshToken };
          }
        } catch (_) {}
      }
    });

    // Reattach all registered events to the new socket instance
    const events = [
      'partner:invite-created',
      'partner:invite-updated',
      'partner:connected',
      'partner:disconnected',
      'partner:workspace-updated',
      'partner:notification',
      'partner:message',
      'partner:online',
      'partner:offline',
    ];

    events.forEach((evt) => {
      socket.on(evt, (data) => {
        console.log(`[Socket] Received event [${evt}]:`, data);
        dispatch(evt, data);
      });
    });

    return socket;
  } catch (err) {
    console.error('[Socket] Initialization error:', err);
    return null;
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Cleanly disconnected.');
  }
}

export function getSocket() {
  return socket;
}

function dispatch(event, data) {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[Socket] Error in listener for ${event}:`, err);
      }
    });
  }
}

export function subscribeToEvent(event, callback) {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(callback);

  return () => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  };
}
