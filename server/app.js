import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './src/config/env.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import errorHandler from './src/middleware/errorHandler.js';
import { notFound } from './src/middleware/notFound.js';

import authRoutes from './src/routes/auth.routes.js';
import menuRoutes from './src/routes/menu.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import locationRoutes from './src/routes/loaction.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import riderRoutes from './src/routes/rider.routes.js';

const app = express();

// Security Middleware - Helmet helps secure Express apps by setting various HTTP headers by default. 
// It can help protect against some well-known web vulnerabilities by setting appropriate HTTP headers.
app.use(helmet({
    crossOriginResourcePolicy : { policy : 'cross-origin' } // This allows resources to be loaded from different origins, which is necessary for our client-server architecture.
}));

// CORS Middleware - This allows the server to accept requests from the specified client URL, 
// enabling cross-origin resource sharing.
app.use(cors({
    origin : config.CLIENT_URL,
    credentials : true, // Allow cookies and other credentials to be sent in cross-origin requests
    methods : ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization'] // Allow these headers in cross-origin requests
    })
);


app.use(express.json({limit : '10mb'})); // This middleware parses incoming JSON requests and makes 
// the data available in req.body.
app.use(express.urlencoded({extended : true, limit : '10mb'})); // This middleware parses incoming
//  requests with URL-encoded payloads, typically from HTML forms,

if (config.NODE_ENV === 'development') {
    app.use(morgan('dev')); // This middleware logs HTTP requests in the console, which is useful 
    // for debugging during development.
}

app.use('/api', generalLimiter);

app.get('/health', (req, res)=> {
    res.status(200).json({
        success : true,
        message : 'Server is healthy',
        environment : config.NODE_ENV,
        timestamp : new Date().toISOString()
    });
});


app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rider', riderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

