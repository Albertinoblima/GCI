// Middleware de logging para debug
export const requestLogger = (req, res, next) => {
    console.log(`📥 [REQUEST] ${req.method} ${req.originalUrl}`);
    console.log(`📥 [REQUEST] Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`📥 [REQUEST] Body:`, JSON.stringify(req.body, null, 2));
    console.log(`📥 [REQUEST] Query:`, JSON.stringify(req.query, null, 2));
    console.log(`📥 [REQUEST] Params:`, JSON.stringify(req.params, null, 2));

    const originalSend = res.send;
    res.send = function (data) {
        console.log(`📤 [RESPONSE] Status: ${res.statusCode}`);
        console.log(`📤 [RESPONSE] Data:`, data);
        return originalSend.call(this, data);
    };

    next();
};

export default requestLogger;
