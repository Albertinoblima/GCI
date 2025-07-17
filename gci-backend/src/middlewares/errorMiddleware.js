// gci-backend/src/middlewares/errorMiddleware.js

import * as config from '../config/appConfig.js'; // Usa a importação correta
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Handler de erros global. Captura todos os erros passados via `next(err)`.
 */
export const globalErrorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Define o status code e a mensagem padrão
    const statusCode = err.statusCode || 500;
    let message = err.message || 'Ocorreu um erro interno no servidor.';

    // Loga o erro com detalhes
    logger.error(message, {
        statusCode: statusCode,
        isOperational: err.isOperational || false,
        path: req.originalUrl,
        method: req.method,
        stack: err.stack,
    });

    // Não vazar detalhes de erros não operacionais/inesperados em produção
    if (config.nodeEnv === 'production' && !err.isOperational) {
        message = 'Ocorreu um erro inesperado no servidor.';
    }

    res.status(statusCode).json({
        status: err.status || 'error',
        message,
        // Adiciona detalhes adicionais apenas em desenvolvimento
        ...(config.nodeEnv === 'development' && { stack: err.stack, details: err.details }),
    });
};

/**
 * Handler para rotas não encontradas (404).
 * Deve ser usado antes do globalErrorHandler.
 */
export const routeNotFoundHandler = (req, res, next) => {
    const error = new AppError(`Endpoint não encontrado: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};