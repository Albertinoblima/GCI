// gci-backend/src/services/authService.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import usuarioRepository from '../repositories/usuarioRepository.js';
import AppError from '../utils/AppError.js';
import { jwt as jwtConfig } from '../config/appConfig.js';

const authService = {
    /**
     * Lida com a lógica de negócios para autenticação de usuários.
     * @param {string} email - O email do usuário.
     * @param {string} senha - A senha do usuário.
     * @returns {Promise<{token: string, usuario: object}>} O token JWT e os dados do usuário.
     */
    async login(email, senha) {
        // 1. Encontrar o usuário pelo email usando o repositório.
        const usuario = await usuarioRepository.findByEmail(email);
        if (!usuario) {
            throw new AppError('E-mail ou senha inválidos.', 401);
        }

        // 2. Verificar se o usuário está ativo
        if (!usuario.ativo) {
            throw new AppError('Este usuário está inativo e não pode fazer login.', 403);
        }

        // 3. Comparar a senha (lógica de negócio).
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) {
            throw new AppError('E-mail ou senha inválidos.', 401);
        }

        // 4. Criar o payload do JWT.
        const payload = {
            id: usuario.id,
            role: usuario.role,
            municipio_id: usuario.municipio_id,
        };

        // 5. Gerar o token JWT.
        const token = jwt.sign(
            payload,
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // 6. Remover a senha do objeto de usuário antes de retorná-lo.
        delete usuario.senha_hash;

        return { token, usuario };
    }
};

export default authService;