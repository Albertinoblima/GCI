// Middleware para normalizar dados antes da validação
export const normalizeDataMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        // Converter strings vazias para null, EXCETO para campos obrigatórios
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') {
                // Não converter 'nome' para null pois é obrigatório
                if (key !== 'nome') {
                    req.body[key] = null;
                }
            }
        });
    }
    next();
};

export default normalizeDataMiddleware;
