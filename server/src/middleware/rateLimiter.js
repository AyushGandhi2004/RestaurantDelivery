import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs : 15*60*1000, // 15 minutes
    max : 100, // limit each IP to 100 requests per windowMs
    message : {
        success : false,
        message : 'Too many requests, please try again later.'
    },
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
});

export const authLimiter = rateLimit({
    windowMs : 15*60*1000, // 15 minutes
    max : 10, // limit each IP to 10 requests per windowMs
    message : {
        success : false,
        message : 'Too many login attempts, please try again later.'
    },
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
});