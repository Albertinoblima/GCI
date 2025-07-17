// gci-backend/src/middlewares/municipioAccessMiddleware.js
import AppError from '../utils/AppError.js';

/**
 * Middleware para validar acesso baseado em município
 * Garante que usuários só acessem dados do seu próprio município
 */
export const validateMunicipioAccess = (options = {}) => {
    return (req, res, next) => {
        const { user } = req;
        const { requireMunicipioId = true, allowAdminSistema = true } = options;

        // Admin sistema tem acesso total (se permitido)
        if (allowAdminSistema && user.role === 'admin_sistema') {
            return next();
        }

        // Verificar se usuário tem município válido
        if (requireMunicipioId && !user.municipio_id) {
            return next(new AppError('Usuário deve estar associado a um município válido.', 403));
        }

        // Verificar se está tentando acessar dados de outro município
        const targetMunicipioId = req.params.municipioId || req.body.municipio_id || req.query.municipio_id;

        if (targetMunicipioId && user.municipio_id && String(user.municipio_id) !== String(targetMunicipioId)) {
            return next(new AppError('Acesso negado. Você só pode acessar dados do seu município.', 403));
        }

        next();
    };
};

/**
 * Middleware específico para rotas de recursos que pertencem a um município
 */
export const validateResourceMunicipioAccess = (getResourceMunicipioId) => {
    return async (req, res, next) => {
        try {
            const { user } = req;

            // Admin sistema tem acesso total
            if (user.role === 'admin_sistema') {
                return next();
            }

            // Obter o município do recurso sendo acessado
            const resourceMunicipioId = await getResourceMunicipioId(req);

            if (!resourceMunicipioId) {
                return next(new AppError('Não foi possível identificar o município do recurso.', 500));
            }

            // Verificar se usuário tem acesso ao município do recurso
            if (String(user.municipio_id) !== String(resourceMunicipioId)) {
                return next(new AppError('Acesso negado. Recurso pertence a outro município.', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
