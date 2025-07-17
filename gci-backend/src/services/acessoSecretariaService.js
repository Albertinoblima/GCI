// gci-backend/src/services/acessoSecretariaService.js

import db from '../config/db.js'; // db ainda é necessário para a transação
import acessoSecretariaRepository from '../repositories/acessoSecretariaRepository.js';
import usuarioRepository from '../repositories/usuarioRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const acessoSecretariaService = {
    /**
     * Busca os IDs de todas as secretarias às quais um usuário tem acesso.
     * @param {number} usuarioId - O ID do usuário.
     * @returns {Promise<number[]>} Um array com os IDs das secretarias.
     */
    async findByUsuarioId(usuarioId) {
        return await acessoSecretariaRepository.findByUsuarioId(usuarioId);
    },

    /**
     * Define/sobrescreve todas as permissões de acesso a secretarias para um único usuário.
     * Esta operação é transacional para garantir atomicidade.
     * @param {number} usuarioId - O ID do usuário a ser atualizado.
     * @param {number[]} secretariaIds - Um array com os novos IDs de secretaria.
     * @param {Object} usuarioLogado - O usuário que está executando a operação.
     * @returns {Promise<{message: string, count: number}>} Mensagem de sucesso e contagem de vínculos.
     */
    async setAcessos(usuarioId, secretariaIds, usuarioLogado) {
        // CORREÇÃO CRÍTICA: Validar se usuário tem permissão para alterar acessos
        if (!usuarioLogado || !usuarioLogado.role) {
            throw new AppError('Usuário logado inválido.', 403);
        }

        // Apenas admin_sistema e admin_municipio podem alterar acessos
        if (!['admin_sistema', 'admin_municipio'].includes(usuarioLogado.role)) {
            throw new AppError('Apenas administradores podem alterar acessos a secretarias.', 403);
        }

        // Se for admin_municipio, verificar se usuário alvo pertence ao mesmo município
        if (usuarioLogado.role === 'admin_municipio') {
            if (!usuarioLogado.municipio_id) {
                throw new AppError('Admin município deve ter município válido.', 403);
            }

            // Verificar se usuário alvo pertence ao mesmo município
            const usuarioAlvo = await usuarioRepository.findById(usuarioId);
            if (!usuarioAlvo || usuarioAlvo.municipio_id !== usuarioLogado.municipio_id) {
                throw new AppError('Você só pode alterar acessos de usuários do seu município.', 403);
            }
        }

        // A lógica de transação permanece no serviço, pois coordena múltiplas operações.
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Apaga todos os vínculos existentes para este usuário.
            await acessoSecretariaRepository.deleteByUsuarioId(usuarioId, client);

            // 2. Insere os novos vínculos.
            const count = await acessoSecretariaRepository.bulkInsert(usuarioId, secretariaIds, client);

            await client.query('COMMIT');

            return {
                message: 'Acessos do usuário atualizados com sucesso.',
                count
            };
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Erro transacional ao definir acessos de secretaria:', { error: error.message });
            if (error.code === '23503') { // Foreign key violation
                throw new AppError('Um ou mais IDs de secretaria ou de usuário fornecidos são inválidos.', 400);
            }
            throw new AppError('Erro ao atualizar acessos do usuário.', 500);
        } finally {
            client.release();
        }
    },
};

export default acessoSecretariaService;