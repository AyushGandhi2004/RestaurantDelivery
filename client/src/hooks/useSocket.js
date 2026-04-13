import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/constants.js';

let socketInstance = null;

// Singleton socket — one connection shared across the whole app.
// Re-renders never create duplicate connections.
const getSocket = (token) => {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(API_URL, {
      auth:              { token },
      transports:        ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect:       true,
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// ── useSocket hook ─────────────────────────────────────────────
// Returns a stable socket instance and a helper to join an order room.
// Cleans up listeners on unmount but does NOT disconnect the socket
// (it stays alive for the session).
const useSocket = () => {
  const token     = localStorage.getItem('token');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('auth_error', ({ message }) => {
      console.error('Socket auth error:', message);
    });

    return () => {
      // Remove only the generic listeners added here.
      // Event-specific listeners (order_status_update, rider_location)
      // are cleaned up by the components that register them.
      socket.off('connect');
      socket.off('disconnect');
      socket.off('auth_error');
    };
  }, [token]);

  const joinOrderRoom = useCallback((orderId) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('joinOrderRoom', { orderId });
  }, []);

  return { socket: socketRef.current, joinOrderRoom };
};

export default useSocket;