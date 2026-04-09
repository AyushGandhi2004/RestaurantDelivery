import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDb from './src/config/db.js';

import { config } from './src/config/env.js';
import redis from './src/config/redis.js';
import { initOrderSocket } from './src/sockets/orderSocket.js';
import { initLocationSocket } from './src/sockets/locationSocket.js';

// ── Create HTTP server from Express app ───────────────────────
// We do this here and NOT in app.js so that Socket.io can attach
// to the same underlying HTTP server. app.js stays pure Express.
const httpServer = http.createServer(app);


// ── Attach Socket.io to the HTTP server ───────────────────────
const io = new Server(httpServer, {
    cors : {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
});


// ── Export io so controllers can emit events ──────────────────
// Any controller that needs to push a real-time event imports
// this. We export it before the socket handlers are registered
// so there is no circular dependency issue.
export { io };


// ── Register socket namespaces / event handlers ───────────────
initOrderSocket(io);
initLocationSocket(io);

//Boot Sequence
const start = async () => {
    try {
        await connectDb();
        await redis.connect();

        httpServer.listen(config.PORT, () => {
            console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
            console.log(`Health check endpoint: http://localhost:${config.PORT}/health`);
        });
    }catch(error){
        console.error("Error starting server:", error);
        process.exit(1);
    }
};


//Graceful shutdown
// Ensures open DB connections are closed cleanly when the
// process receives a termination signal (e.g. Render restart)

const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
        try {
        await redis.quit();
        console.log('Redis connection closed');
        process.exit(0);
        } catch (err) {
        console.error('Error during shutdown:', err.message);
        process.exit(1);
        }
    });
};

process.on('SIGINT', () => shutdown('SIGINT')); // Handle Ctrl+C interrupt signal
process.on('SIGTERM', () => shutdown('SIGTERM')); // Handle termination signal (e.g. from Render restart)

start();