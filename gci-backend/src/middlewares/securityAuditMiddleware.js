// gci-backend/src/middlewares/securityAuditMiddleware.js
import logger from '../utils/logger.js';

/**
 * Middleware para auditoria de segurança
 * Loga todas as tentativas de acesso a recursos críticos
 */
export const securityAuditMiddleware = (resourceType) => {
    return (req, res, next) => {
        const { user } = req;
        const { method, originalUrl, params, body } = req;

        // Log da tentativa de acesso
        logger.info(`[SECURITY AUDIT] ${resourceType} - ${method} ${originalUrl}`, {
            userId: user?.id,
            userEmail: user?.email,
            userRole: user?.role,
            userMunicipio: user?.municipio_id,
            params: params,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        });

        // Para operações sensíveis, fazer log adicional
        if (['DELETE', 'PUT', 'POST'].includes(method) && resourceType === 'usuarios') {
            logger.warn(`[SECURITY AUDIT] OPERAÇÃO CRÍTICA - ${method} em usuários`, {
                userId: user?.id,
                userEmail: user?.email,
                userRole: user?.role,
                targetId: params?.id,
                bodyData: body ? JSON.stringify(body) : null,
                timestamp: new Date().toISOString()
            });
        }

        next();
    };
};

/**
 * Middleware para detectar tentativas de bypass de hierarquia
 */
export const hierarchyBypassDetection = () => {
    return (req, res, next) => {
        const { user } = req;
        const { method, originalUrl, params } = req;

        // Monitorar tentativas suspeitas
        if (user?.role !== 'admin_sistema' && originalUrl.includes('/usuarios/')) {
            const targetUserId = params?.id;

            if (targetUserId) {
                logger.warn(`[HIERARCHY SECURITY] Tentativa de acesso a usuário específico`, {
                    requesterUserId: user.id,
                    requesterEmail: user.email,
                    requesterRole: user.role,
                    targetUserId: targetUserId,
                    method: method,
                    url: originalUrl,
                    timestamp: new Date().toISOString()
                });
            }
        }

        next();
    };
};

/**
 * Middleware para interceptar respostas e detectar vazamentos de dados
 */
export const dataLeakageDetection = () => {
    return (req, res, next) => {
        const { user } = req;
        const originalSend = res.send;

        res.send = function (data) {
            try {
                // Verificar se há dados sensíveis sendo vazados
                if (user?.role !== 'admin_sistema' && typeof data === 'string') {
                    const parsedData = JSON.parse(data);

                    // Verificar se há usuários admin_sistema na resposta
                    if (parsedData?.data?.usuarios || parsedData?.data?.usuario) {
                        const usuarios = parsedData.data.usuarios || [parsedData.data.usuario];

                        const adminSistemaFound = usuarios.some(u => u.role === 'admin_sistema');

                        if (adminSistemaFound) {
                            logger.error(`[DATA LEAK DETECTED] Admin sistema apareceu na resposta para usuário não-admin`, {
                                requesterUserId: user.id,
                                requesterEmail: user.email,
                                requesterRole: user.role,
                                url: req.originalUrl,
                                timestamp: new Date().toISOString()
                            });

                            // Filtrar dados sensíveis
                            if (parsedData.data.usuarios) {
                                parsedData.data.usuarios = parsedData.data.usuarios.filter(u => u.role !== 'admin_sistema');
                            } else if (parsedData.data.usuario?.role === 'admin_sistema') {
                                return originalSend.call(this, JSON.stringify({
                                    status: 'error',
                                    message: 'Acesso negado'
                                }));
                            }

                            data = JSON.stringify(parsedData);
                        }
                    }
                }
            } catch (error) {
                // Em caso de erro no parsing, apenas logar
                logger.error('Erro no middleware de detecção de vazamento de dados', error);
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

export default { securityAuditMiddleware, hierarchyBypassDetection, dataLeakageDetection };
