const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    console.error('SERVER ERROR:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
