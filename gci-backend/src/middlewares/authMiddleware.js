// gci-backend/src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { jwt as jwtConfig } from '../config/appConfig.js';
import usuarioRepository from '../repositories/usuarioRepository.js'; // Importa o repositório

export const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            console.log('🔐 [AUTH DEBUG] Middleware de auth executando para:', req.method, req.originalUrl);

            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                console.log('❌ [AUTH DEBUG] Token não fornecido');
                throw new AppError('Token de acesso não fornecido.', 401);
            }

            const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
            if (!token) {
                console.log('❌ [AUTH DEBUG] Token inválido');
                return next(new AppError('Acesso negado. Token inválido.', 401));
            }

            console.log('🔍 [AUTH DEBUG] Verificando token...');
            const decodedPayload = jwt.verify(token, jwtConfig.secret);
            console.log('✅ [AUTH DEBUG] Token válido, payload:', decodedPayload);

            // **MELHORIA:** Busca o usuário completo no banco a cada requisição.
            // Isso garante que os dados (especialmente 'role' e 'ativo') estejam sempre atualizados.
            // Para performance, em sistemas de altíssimo tráfego, poderia-se cachear isso (ex: Redis).
            console.log('👤 [AUTH DEBUG] Buscando usuário no banco...');
            const usuario = await usuarioRepository.findById(decodedPayload.id);

            if (!usuario || !usuario.ativo) {
                console.log('❌ [AUTH DEBUG] Usuário não encontrado ou inativo');
                return next(new AppError('Autenticação falhou. Usuário não encontrado ou inativo.', 401));
            }

            console.log('✅ [AUTH DEBUG] Usuário encontrado:', usuario.email, 'Role:', usuario.role);

            // Anexa o objeto de usuário completo (sem a senha) à requisição
            delete usuario.senha_hash;
            req.user = usuario;

            // CORREÇÃO CRÍTICA: Validar se usuário tem município válido quando necessário
            const requiresMunicipio = ['admin_municipio', 'gestor_secretaria', 'agente_saude', 'agente_educacao', 'agente_atendimento'];
            if (requiresMunicipio.includes(usuario.role) && !usuario.municipio_id) {
                console.log('❌ [AUTH DEBUG] Usuário com role que requer município não tem município válido');
                return next(new AppError('Usuário deve estar associado a um município válido.', 403));
            }

            // Validação de Role
            if (roles.length > 0 && !roles.includes(usuario.role)) {
                console.log('❌ [AUTH DEBUG] Permissão negada. Role do usuário:', usuario.role, 'Roles necessárias:', roles);
                return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
            }

            console.log('✅ [AUTH DEBUG] Autenticação e autorização concluídas com sucesso');
            next();
        } catch (error) {
            console.error('❌ [AUTH DEBUG] Erro no middleware de auth:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            if (error instanceof jwt.JsonWebTokenError) {
                return next(new AppError('Token inválido ou expirado.', 401));
            }
            next(error);
        }
    };
};