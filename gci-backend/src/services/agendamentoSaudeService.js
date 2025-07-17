// gci-backend/src/services/agendamentoSaudeService.js

import db from '../config/db.js'; // Necessário para a transação
import agendamentoSaudeRepository from '../repositories/agendamentoSaudeRepository.js';
import horarioDisponivelSaudeRepository from '../repositories/horarioDisponivelSaudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const agendamentoSaudeService = {
    /**
     * Cria um novo agendamento de saúde de forma transacional.
     * @param {object} dadosAgendamento - Dados do agendamento.
     * @returns {Promise<object>} O agendamento criado.
     */
    async create(dadosAgendamento) {
        const { horario_disponivel_id, cidadao_id } = dadosAgendamento;
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // 1. Usa o repositório para tentar "reservar" o slot de horário.
            const horarioAtualizado = await horarioDisponivelSaudeRepository.setStatusAgendado(horario_disponivel_id, client);
            if (!horarioAtualizado) {
                throw new AppError('Horário não está disponível para agendamento.', 409); // 409 Conflict
            }

            // 2. Usa o repositório para criar o registro do agendamento.
            const novoAgendamento = await agendamentoSaudeRepository.create(dadosAgendamento, client);

            await client.query('COMMIT');

            logger.info(`Agendamento de saúde criado (ID: ${novoAgendamento.id}) para o cidadão ID ${cidadao_id}`);
            return novoAgendamento;
        } catch (err) {
            await client.query('ROLLBACK');
            if (err instanceof AppError) throw err; // Re-lança o erro de negócio

            if (err.code === '23505' || err.code === '23503') { // unique_violation or foreign key
                throw new AppError('Não foi possível realizar o agendamento devido a dados inválidos ou horário já ocupado.', 409);
            }
            logger.error('Erro transacional ao criar agendamento de saúde.', { error: err.message });
            throw new AppError('Não foi possível realizar o agendamento.', 500);
        } finally {
            client.release();
        }
    },

    /**
     * Lista todos os agendamentos de saúde com filtros opcionais
     * @param {object} filters - Filtros opcionais 
     * @param {object} user - Usuário logado
     * @returns {Promise<object>} Lista de agendamentos
     */
    async findAll(filters = {}, user) {
        try {
            const agendamentos = await agendamentoSaudeRepository.findAll(filters, user);
            return { agendamentos };
        } catch (error) {
            logger.error('Erro ao buscar agendamentos de saúde.', { error: error.message });
            throw new AppError('Não foi possível buscar os agendamentos.', 500);
        }
    },

    /**
     * Busca um agendamento por ID
     * @param {number} id - ID do agendamento
     * @param {object} user - Usuário logado  
     * @returns {Promise<object>} Agendamento encontrado
     */
    async findById(id, user) {
        try {
            const agendamento = await agendamentoSaudeRepository.findById(id, user);
            if (!agendamento) {
                throw new AppError('Agendamento não encontrado.', 404);
            }
            return agendamento;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Erro ao buscar agendamento por ID.', { error: error.message });
            throw new AppError('Não foi possível buscar o agendamento.', 500);
        }
    },

    // ...existing code...
};

export default agendamentoSaudeService;