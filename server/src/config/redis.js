import Redis from 'ioredis';
import {config} from './env.js'
// import { lazy } from 'react';

const redis = new Redis(config.REDIS_URL, {
    password: config.REDIS_TOKEN,
    tls : {},
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

redis.on('connect', ()=> console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;