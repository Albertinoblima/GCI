// gci-backend/src/middlewares/securityLogMiddleware.js
import logger from '../utils/logger.js';

/**
 * Middleware para logging de eventos de segurança
 * Registra tentativas de acesso negado, falhas de autenticação, etc.
 */
export const securityLogMiddleware = (req, res, next) => {
    const originalNext = next;

    // Interceptar erros de segurança
    req.logSecurityEvent = (event, details = {}) => {
        const securityLog = {
            timestamp: new Date().toISOString(),
            event,
            user: req.user ? {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                municipio_id: req.user.municipio_id
            } : null,
            request: {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
            },
            details
        };

        // Log com nível apropriado baseado no tipo de evento
        if (event.includes('DENIED') || event.includes('UNAUTHORIZED')) {
            logger.warn('🔒 SECURITY EVENT', securityLog);
        } else if (event.includes('BYPASS') || event.includes('EXPLOIT')) {
            logger.error('🚨 CRITICAL SECURITY EVENT', securityLog);
        } else {
            logger.info('🔍 SECURITY EVENT', securityLog);
        }
    };

    // Substituir next para capturar erros de segurança
    const enhancedNext = (error) => {
        if (error) {
            // Identificar erros de segurança
            if (error.statusCode === 403 || error.statusCode === 401) {
                req.logSecurityEvent('ACCESS_DENIED', {
                    error: error.message,
                    statusCode: error.statusCode
                });
            }
        }
        originalNext(error);
    };

    // Substituir req.next temporariamente
    req.securityNext = enhancedNext;
    next();
};

/**
 * Middleware específico para logging de tentativas de acesso a recursos
 */
export const resourceAccessLogger = (resourceType) => {
    return (req, res, next) => {
        const { user } = req;
        const resourceId = req.params.id || req.params.municipioId || req.params.secretariaId;

        if (user && resourceId) {
            req.logSecurityEvent?.('RESOURCE_ACCESS_ATTEMPT', {
                resourceType,
                resourceId,
                userRole: user.role,
                userMunicipio: user.municipio_id
            });
        }

        next();
    };
};

export default securityLogMiddleware;
