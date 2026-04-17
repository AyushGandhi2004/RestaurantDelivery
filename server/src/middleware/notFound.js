export const notFound = (req, res, next) => {
    const error = new Error(`Path Not Found - ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};