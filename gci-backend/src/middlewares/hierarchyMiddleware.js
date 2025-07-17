// gci-backend/src/middlewares/hierarchyMiddleware.js
import AppError from '../utils/AppError.js';

/**
 * Middleware para validar hierarquia de usuários
 * Garante que usuários não podem acessar/modificar usuários de nível superior
 */

// Definir hierarquia de roles (menor número = maior poder)
const ROLE_HIERARCHY = {
    'admin_sistema': 1,
    'admin_municipio': 2,
    'gestor_secretaria': 3,
    'agente_saude': 4,
    'agente_educacao': 4,
    'agente_atendimento': 4,
    'cidadao': 5
};

/**
 * Obtém o nível hierárquico de uma role
 */
const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] || 999; // Roles desconhecidas têm nível mais baixo
};

/**
 * Verifica se uma role pode gerenciar outra
 */
const canManageRole = (managerRole, targetRole) => {
    const managerLevel = getRoleLevel(managerRole);
    const targetLevel = getRoleLevel(targetRole);

    // Apenas pode gerenciar roles de nível inferior
    return managerLevel < targetLevel;
};

/**
 * Middleware para validar hierarquia em operações de usuários
 */
export const validateUserHierarchy = () => {
    return async (req, res, next) => {
        try {
            const { user } = req;
            const { method } = req;

            // Aplicar validação apenas em operações críticas
            if (!['GET', 'PUT', 'DELETE'].includes(method)) {
                return next();
            }

            // Para operações em usuários específicos
            const targetUserId = req.params.id;
            if (targetUserId && user.role !== 'admin_sistema') {
                // Buscar usuário alvo para validar hierarquia
                // (Este middleware deve ser usado após authMiddleware)
                req.validateTargetUserHierarchy = async (targetUser) => {
                    if (!targetUser) return;

                    // CRÍTICO: Verificar se pode gerenciar o usuário alvo
                    if (!canManageRole(user.role, targetUser.role)) {
                        throw new AppError(
                            `Acesso negado. Sua role (${user.role}) não pode gerenciar usuários com role (${targetUser.role}).`,
                            403
                        );
                    }

                    // CRÍTICO: Admin município nunca pode gerenciar admin_sistema
                    if (user.role !== 'admin_sistema' && targetUser.role === 'admin_sistema') {
                        throw new AppError(
                            'Acesso negado. Você não tem permissão para gerenciar administradores do sistema.',
                            403
                        );
                    }

                    // CRÍTICO: Usuários do mesmo nível não podem se gerenciar (exceto próprio)
                    if (getRoleLevel(user.role) === getRoleLevel(targetUser.role) && user.id !== targetUser.id) {
                        throw new AppError(
                            'Acesso negado. Você não pode gerenciar usuários do mesmo nível hierárquico.',
                            403
                        );
                    }
                };
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware para validar criação de usuários
 */
export const validateUserCreationHierarchy = () => {
    return (req, res, next) => {
        try {
            const { user } = req;
            const { role: targetRole } = req.body;

            if (!targetRole) {
                return next();
            }

            // CRÍTICO: Verificar se pode criar usuário com a role especificada
            if (!canManageRole(user.role, targetRole)) {
                throw new AppError(
                    `Acesso negado. Sua role (${user.role}) não pode criar usuários com role (${targetRole}).`,
                    403
                );
            }

            // CRÍTICO: Apenas admin_sistema pode criar admin_sistema
            if (targetRole === 'admin_sistema' && user.role !== 'admin_sistema') {
                throw new AppError(
                    'Acesso negado. Apenas administradores do sistema podem criar outros administradores do sistema.',
                    403
                );
            }

            // CRÍTICO: Admin município não pode criar outros admin_municipio
            if (user.role === 'admin_municipio' && targetRole === 'admin_municipio') {
                throw new AppError(
                    'Acesso negado. Administradores municipais não podem criar outros administradores municipais.',
                    403
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Função helper para validação de hierarquia
 */
export const validateHierarchy = {
    canManageRole,
    getRoleLevel,

    // Verifica se usuário pode acessar outro usuário
    canAccessUser: (requesterRole, targetRole) => {
        // Admin sistema pode acessar todos
        if (requesterRole === 'admin_sistema') return true;

        // Outros só podem acessar roles inferiores
        return canManageRole(requesterRole, targetRole);
    },

    // Verifica se é uma operação permitida
    isOperationAllowed: (requesterRole, targetRole, operation) => {
        // Admin sistema pode fazer qualquer operação
        if (requesterRole === 'admin_sistema') return true;

        // Para operações destrutivas, ser mais restritivo
        if (['DELETE', 'UPDATE_ROLE'].includes(operation)) {
            return canManageRole(requesterRole, targetRole) && targetRole !== 'admin_sistema';
        }

        return canManageRole(requesterRole, targetRole);
    }
};

export default validateUserHierarchy;
